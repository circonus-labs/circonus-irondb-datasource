package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"time"

	jsonp "github.com/buger/jsonparser"
	circ "github.com/circonus-labs/go-apiclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// newDatasource returns datasource.ServeOpts.
func newDatasource() datasource.ServeOpts {
	// creates a instance manager for your plugin. The function passed
	// into `NewInstanceManger` is called when the instance is created
	// for the first time or when a datasource configuration changed.
	im := datasource.NewInstanceManager(newDataSourceInstance)
	ds := &SampleDatasource{
		im: im,
	}

	return datasource.ServeOpts{
		QueryDataHandler:   ds,
		CheckHealthHandler: ds,
	}
}

// SampleDatasource is an example datasource used to scaffold
// new datasource plugins with an backend.
type SampleDatasource struct {
	// The instance manager can help with lifecycle management
	// of datasource instances in plugins. It's not a requirements
	// but a best practice that we recommend that you follow.
	im          instancemgmt.InstanceManager
	circ        *circ.API
	qrs         map[string]backend.DataResponse
	truncateNow bool
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (td *SampleDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// init client once
	if td.circ == nil {
		cfg := req.PluginContext.DataSourceInstanceSettings.JSONData
		dbType, err := jsonp.GetString(cfg, "irondbType")
		if err != nil {
			return nil, err
		}

		if dbType != "hosted" {
			return nil, fmt.Errorf("only `hosted` is currently supported")
		}

		key, err := jsonp.GetString(cfg, "apiToken")
		if err != nil {
			return nil, err
		}

		queryURL, err := jsonp.GetString(cfg, "URL")
		if err != nil {
			return nil, err
		}

		td.circ, err = circ.New(&circ.Config{
			TokenKey: key,
			TokenApp: "circonus-irondb-datasource",
			URL:      queryURL,
		})
		if err != nil {
			return nil, err
		}

		// CIRC-6967 -- truncate last data sample if _end within 1s of now
		tn, err := jsonp.GetBoolean(cfg, "truncateNow")
		if err == nil { // only apply if setting found
			td.truncateNow = tn
		}
	}
	if td.qrs == nil {
		td.qrs = make(map[string]backend.DataResponse)
	}

	rv := backend.NewQueryDataResponse()
	for _, q := range req.Queries {
		qtype, err := jsonp.GetString(q.JSON, "querytype")
		if err != nil {
			return nil, err
		}

		var response *backend.DataResponse
		switch qtype {
		case "caql":
			response, err = td.caqlQuery(ctx, q)
			if err != nil {
				return nil, err
			}
		case "basic":
			response, err = td.basicQuery(ctx, q)
			if err != nil {
				return nil, err
			}
		default:
			return nil, fmt.Errorf("unsupported query type %s, try (caql, basic)", qtype)
		}
		rv.Responses[q.RefID] = *response
		td.qrs[q.RefID] = *response
	}
	return rv, nil
}

func (td *SampleDatasource) query(ctx context.Context, query backend.DataQuery) backend.DataResponse { //nolint:unused
	return backend.DataResponse{}
}

func (td *SampleDatasource) basicQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
	basic, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		return nil, err
	}

	iq := IrondbQuery{Basic: basic}
	err = iq.ParseBasic()
	if err != nil {
		return nil, err
	}
	query, err := iq.ToCaql()
	if err != nil {
		return nil, err
	}

	return td.caqlAPI(ctx, q, query)
}

func (td *SampleDatasource) caqlQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
	query, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		return nil, err
	}

	// If needed include min_period setting in the CAQL query.
	if !strings.HasPrefix(query, "#min_period=") {
		minPeriod, err := jsonp.GetString(q.JSON, "min_period")
		if err != nil {
			if err != jsonp.KeyPathNotFoundError {
				return nil, fmt.Errorf("unable to parse CAQL query min_period: %w", err)
			}
		}

		query = "#min_period=" + minPeriod + " " + query
	}

	log.DefaultLogger.Info("caqlQuery", "caql", query)

	return td.caqlAPI(ctx, q, query)
}

type DF4Response struct {
	Version string      `json:"version"`
	Data    [][]float64 `json:"data"`
	Meta    []DF4Meta   `json:"meta"`
	Head    DF4Head     `json:"head"`
}

type DF4Head struct {
	Count  uint64 `json:"count"`
	Period uint64 `json:"period"`
	Start  uint64 `json:"start"`
}

type DF4Meta struct {
	Kind  string   `json:"kind"`
	Label string   `json:"label"`
	Tags  []string `json:"tags"`
}

func (td *SampleDatasource) caqlAPI(_ context.Context, q backend.DataQuery, query string) (*backend.DataResponse, error) {
	// https://docs.circonus.com/circonus/api/#/CAQL
	qp := url.Values{}
	qp.Set("query", query)
	if td.truncateNow {
		// shift entire query window back by one minute to reduce impact of partial "now" sample(s)
		qp.Set("end", fmt.Sprintf("%d", q.TimeRange.To.Add(-1*time.Minute).Unix()))
		qp.Set("start", fmt.Sprintf("%d", q.TimeRange.From.Add(-1*time.Minute).Unix()))
	} else {
		qp.Set("end", fmt.Sprintf("%d", q.TimeRange.To.Unix()))
		qp.Set("start", fmt.Sprintf("%d", q.TimeRange.From.Unix()))
	}
	qp.Set("period", "60") // because q.Interval is 0 fmt.Sprintf("%d", int(q.Interval.Seconds())))
	qp.Set("format", "DF4")
	path := url.URL{
		Path:     "/v2/caql",
		RawQuery: qp.Encode(),
	}

	// log.DefaultLogger.Info("caql api", "path", path.String())

	respdata, err := td.circ.Get(path.String())
	if err != nil {
		return nil, err
	}

	var resp DF4Response
	if err := json.Unmarshal(respdata, &resp); err != nil {
		return nil, err
	}

	if resp.Version != "DF4" {
		return nil, fmt.Errorf("invalid response version (%s)", resp.Version)
	}

	// updated to reflect what graphite datasource does
	// https://github.com/grafana/grafana/blob/main/pkg/tsdb/graphite/graphite.go#L229-L256

	frames := data.Frames{}
	for id, meta := range resp.Meta {
		if meta.Kind != "numeric" {
			continue
		}
		times := make([]time.Time, 0, len(resp.Data[id]))
		values := make([]float64, 0, len(resp.Data[id]))
		ts := resp.Head.Start
		for _, sample := range resp.Data[id] {
			times = append(times, time.Unix(int64(ts), 0))
			values = append(values, sample)
			ts += resp.Head.Period
		}
		tags := make(map[string]string)
		for _, tag := range meta.Tags {
			if strings.HasPrefix(tag, "__") {
				continue // skip internal tags
			}
			parts := strings.SplitN(tag, ":", 2)
			tc := ""
			tv := ""
			if len(parts) > 0 {
				tc = parts[0]
				if len(parts) > 1 {
					tv = parts[1]
				}
				tags[tc] = tv
			}
		}

		// log.DefaultLogger.Info("add frame", "name", meta.Label, "time", times, "value", values, "tags", tags)

		frames = append(
			frames,
			data.NewFrame(meta.Label, data.NewField("time", nil, times),
				data.NewField("value", tags, values).SetConfig(&data.FieldConfig{DisplayNameFromDS: meta.Label})))
	}

	return &backend.DataResponse{Frames: frames}, nil
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (td *SampleDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Data source is working"

	if rand.Int()%2 == 0 { //nolint:gosec
		status = backend.HealthStatusError
		message = "randomized error"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}

type instanceSettings struct {
	httpClient *http.Client
}

func newDataSourceInstance(setting backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	return &instanceSettings{
		httpClient: &http.Client{},
	}, nil
}

func (s *instanceSettings) Dispose() {
	// Called before creating a new instance to allow plugin authors
	// to cleanup.
}
