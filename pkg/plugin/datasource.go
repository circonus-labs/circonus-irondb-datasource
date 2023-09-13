package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	jsonp "github.com/buger/jsonparser"
	circ "github.com/circonus-labs/go-apiclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces- only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

// NewDatasource creates a new datasource instance.
func NewDatasource(_ backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) { //nolint:ireturn
	im := datasource.NewInstanceManager(newDataSourceInstance)
	ds := &Datasource{
		im: im,
	}

	return ds, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	im          instancemgmt.InstanceManager
	circ        *circ.API
	qrs         map[string]backend.DataResponse
	truncateNow bool
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// init client once
	if d.circ == nil { //nolint:nestif
		cfg := req.PluginContext.DataSourceInstanceSettings.JSONData

		dbType, err := jsonp.GetString(cfg, "irondbType")
		if err != nil {
			log.DefaultLogger.Error("key irondbType missing from configuration JSON",
				"error", err, "config", string(cfg))

			return nil, fmt.Errorf("irondbType missing from configuration JSON: %w", err)
		}

		if dbType != "hosted" {
			log.DefaultLogger.Error("only dbType `hosted` is currently supported")

			return nil, fmt.Errorf("only `hosted` is currently supported") //nolint:goerr113
		}

		key, err := jsonp.GetString(cfg, "apiToken")
		if err != nil {
			log.DefaultLogger.Error("key apiToken missing from configuration JSON",
				"error", err, "config", string(cfg))

			return nil, fmt.Errorf("apiToken missing from configuration JSON: %w", err)
		}

		queryURL := req.PluginContext.DataSourceInstanceSettings.URL

		d.circ, err = circ.New(&circ.Config{
			TokenKey: key,
			TokenApp: "circonus-irondb-datasource",
			URL:      queryURL,
			// Do not allow the API client to automatically retry on 5XX errors.
			// Grafana is responsible for retry behavior.
			DisableRetries: true,
		})
		if err != nil {
			log.DefaultLogger.Error("unable to create circonus go-apiclient",
				"error", err.Error())

			return nil, fmt.Errorf("unable to create circonus go-apiclient: %w", err)
		}

		// CIRC-6967 -- truncate last data sample if _end within 1s of now
		tn, err := jsonp.GetBoolean(cfg, "truncateNow")
		if err == nil { // only apply if setting found
			d.truncateNow = tn
		}
	}

	if d.qrs == nil {
		d.qrs = make(map[string]backend.DataResponse)
	}

	rv := backend.NewQueryDataResponse()
	rmut := sync.Mutex{}
	wg := sync.WaitGroup{}

	for _, q := range req.Queries {
		q := q

		wg.Add(1)

		go func(q *backend.DataQuery) {
			defer wg.Done()

			if q == nil {
				return
			}

			var response *backend.DataResponse

			qtype, err := jsonp.GetString(q.JSON, "querytype")
			if err != nil {
				log.DefaultLogger.Error("key querytype missing from query JSON "+
					"- non-IRONdb dashboard pointed at datasource?",
					"error", err, "query", string(q.JSON), "ref_id", q.RefID)

				response = &backend.DataResponse{
					Error: fmt.Errorf("querytype missing from query JSON: %w "+
						"- non-IRONdb dashboard pointed at datasource?", err),
				}
			} else {
				switch qtype {
				case "caql":
					response, err = d.caqlQuery(ctx, *q)
					if err != nil {
						log.DefaultLogger.Error("unable to execute CAQL query",
							"error", err, "query", q)
						response = &backend.DataResponse{
							Error: fmt.Errorf("unable to execute CAQL query: %w", err),
						}
					}
				case "basic":
					response, err = d.basicQuery(ctx, *q)
					if err != nil {
						log.DefaultLogger.Error("unable to execute basic query",
							"error", err, "query", q)
						response = &backend.DataResponse{
							Error: fmt.Errorf("unable to execute basic query: %w", err),
						}
					}
				case "graphite":
					response, err = d.graphiteQuery(ctx, *q)
					if err != nil {
						log.DefaultLogger.Error("unable to execute graphite query",
							"error", err, "query", q)
						response = &backend.DataResponse{
							Error: fmt.Errorf("unable to execute graphite query: %w", err),
						}
					}
				default:
					log.DefaultLogger.Error("unsupported query type, try (caql, basic)",
						"qtype", qtype)
					response = &backend.DataResponse{
						Error: fmt.Errorf("unsupported query type %s, try (caql, basic)", qtype), //nolint:goerr113
					}
				}
			}

			rmut.Lock()
			rv.Responses[q.RefID] = *response
			d.qrs[q.RefID] = *response
			rmut.Unlock()
		}(&q)
	}

	wg.Wait()

	return rv, nil
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(_ context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk

	var message = "Data source is working"

	if rand.Int()%2 == 0 { //nolint:gosec // G404 - not used for crypto
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

func newDataSourceInstance(_ backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) { //nolint:ireturn
	return &instanceSettings{
		httpClient: &http.Client{},
	}, nil
}

func (s *instanceSettings) Dispose() {
	// Called before creating a new instance to allow plugin authors
	// to cleanup.
}

type DF4Response struct {
	Version string          `json:"version"`
	Data    [][]interface{} `json:"data"`
	Meta    []DF4Meta       `json:"meta"`
	Head    DF4Head         `json:"head"`
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

func (d *Datasource) caqlAPI(_ context.Context, q backend.DataQuery, query string) (*backend.DataResponse, error) {
	// If needed include min_period setting in the CAQL query.
	if !strings.HasPrefix(query, "#min_period=") {
		minPeriod, err := jsonp.GetString(q.JSON, "min_period")
		if err != nil && errors.Is(err, jsonp.KeyPathNotFoundError) {
			log.DefaultLogger.Error("unable to parse CAQL query min_period", "error", err)

			return nil, fmt.Errorf("unable to parse CAQL query min_period: %w", err)
		}

		if minPeriod != "" {
			query = "#min_period=" + minPeriod + " " + query
		}
	}

	// https://docs.circonus.com/circonus/api/#/CAQL
	qp := url.Values{}
	qp.Set("query", query)

	if d.truncateNow {
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

	respdata, err := d.circ.Get(path.String())
	if err != nil {
		log.DefaultLogger.Error("error returned from circonus api",
			"error", err, "request", path.String())

		return nil, fmt.Errorf("error returned from circonus API: %w", err)
	}

	var resp DF4Response
	if err := json.Unmarshal(respdata, &resp); err != nil {
		log.DefaultLogger.Error("unable to unmarshal response data",
			"error", err, "response", string(respdata))

		return nil, fmt.Errorf("unable to unmarshal response data: %w", err)
	}

	if resp.Version != "DF4" {
		log.DefaultLogger.Error("invalid response version", "version", resp.Version)

		return nil, fmt.Errorf("invalid response version (%s)", resp.Version) //nolint:goerr113
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
			ts += resp.Head.Period

			if val, ok := sample.(float64); ok {
				values = append(values, val)
			} else {
				values = append(values, 0)
			}
		}

		tags := make(map[string]string)

		for _, tag := range meta.Tags {
			if strings.HasPrefix(tag, "__") {
				continue // skip internal tags
			}

			parts := strings.SplitN(tag, ":", 2)
			tc := "" //nolint:wastedassign
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

func (d *Datasource) basicQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
	basic, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		log.DefaultLogger.Error("key query missing from basic query",
			"error", err, "query", string(q.JSON))

		return nil, fmt.Errorf("key query missing from basic query: %w", err)
	}

	iq := IrondbQuery{Basic: basic}
	err = iq.ParseBasic()

	if err != nil {
		log.DefaultLogger.Error("unable to parse basic query", "error", err)

		return nil, fmt.Errorf("unable to parse basic query: %w", err)
	}

	query, err := iq.ToCaql()

	if err != nil {
		log.DefaultLogger.Error("unable to convert basic query to CAQL", "error", err)

		return nil, fmt.Errorf("unable to convert basic query to CAQL: %w", err)
	}

	return d.caqlAPI(ctx, q, query)
}

func (d *Datasource) caqlQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
	query, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		log.DefaultLogger.Error("key query missing from CAQL query", "error", err)

		return nil, fmt.Errorf("key query missing from CAQL query: %w", err)
	}

	log.DefaultLogger.Info("caqlQuery", "caql", query)

	return d.caqlAPI(ctx, q, query)
}

func (d *Datasource) graphiteQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
	query, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		log.DefaultLogger.Error("key query missing from graphite query", "error", err, "query", string(q.JSON))

		return nil, fmt.Errorf("key query missing from graphite query: %w", err)
	}

	tagFilter, err := jsonp.GetString(q.JSON, "tagFilter")
	if err != nil && errors.Is(err, jsonp.KeyPathNotFoundError) {
		log.DefaultLogger.Error("unable to get tagFilter for graphite query", "error", err, "query", string(q.JSON))

		return nil, fmt.Errorf("unable to get tagFilter for graphite query: %w", err)
	}

	// Convert the graphite query to an equivalent CAQL query.
	caqlQ := "graphite:find('" + strings.ReplaceAll(query, " ", "") + "'"

	if tagFilter != "" {
		caqlQ += ",'" + tagFilter + "'"
	}

	caqlQ += ")"

	log.DefaultLogger.Info("graphiteQuery", "graphite", query, "caql", caqlQ)

	return d.caqlAPI(ctx, q, caqlQ)
}
