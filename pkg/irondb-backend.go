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
	"github.com/pkg/errors"
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
// req contains the queries []DataQuery (where each query contains RefID as a unique identifer).
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
			return nil, errors.New("only `hosted` is currently supported")
		}

		key, err := jsonp.GetString(cfg, "apiToken")
		if err != nil {
			return nil, err
		}
		td.circ, err = circ.New(&circ.Config{TokenKey: key})
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
		if qtype == "caql" {
			response, err = td.caqlQuery(context.Background(), q)
			if err != nil {
				return nil, err
			}
		} else if qtype == "basic" {
			response, err = td.basicQuery(context.Background(), q)
			if err != nil {
				return nil, err
			}
		} else {
			return nil, errors.Errorf("Unsupported query type %s, try (caql, basic)", qtype)
		}
		rv.Responses[q.RefID] = *response
		td.qrs[q.RefID] = *response
	}
	return rv, nil
}

func (td *SampleDatasource) query(ctx context.Context, query backend.DataQuery) backend.DataResponse {
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

	return td.caqlApi(ctx, q, query)
}

func (td *SampleDatasource) caqlQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
	query, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		return nil, err
	}
	log.DefaultLogger.Info("caqlQuery", "caql", query)

	return td.caqlApi(ctx, q, query)
}

type DF4Response struct {
	Data    [][]float64 `json:"data"`
	Meta    []DF4Meta   `json:"meta"`
	Head    DF4Head     `json:"head"`
	Version string      `json:"version"`
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

func (td *SampleDatasource) caqlApi(ctx context.Context, q backend.DataQuery, query string) (*backend.DataResponse, error) {
	// https://docs.circonus.com/circonus/api/#/CAQL
	qp := url.Values{}
	qp.Set("query", query)
	qp.Set("end", fmt.Sprintf("%d", q.TimeRange.To.Unix()))
	qp.Set("start", fmt.Sprintf("%d", q.TimeRange.From.Unix()))
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

	frames := data.Frames{}
	for id, meta := range resp.Meta {
		if meta.Kind != "numeric" {
			continue
		}
		times := make([]uint64, 0, len(resp.Data[id]))
		values := make([]float64, 0, len(resp.Data[id]))
		ts := resp.Head.Start
		for _, sample := range resp.Data[id] {
			times = append(times, ts)
			values = append(values, sample)
			ts += resp.Head.Period
		}
		tags := make(map[string]string)
		for _, tag := range meta.Tags {
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
		frames = append(frames, data.NewFrame(meta.Label, data.NewField("time", nil, times),
			data.NewField("value", tags, values).SetConfig(&data.FieldConfig{DisplayNameFromDS: meta.Label})))
	}

	return &backend.DataResponse{Frames: frames}, nil

	/*
		jsonStr := string(data)

		// base64-encoded json response body, sometimes
		if !strings.HasPrefix(jsonStr, "{") {
			// if it's not a json object, it's base64 encoded
			jsonBase64, err := strconv.Unquote(strings.TrimSpace(jsonStr))
			if err != nil {
				return nil, err
			}
			data, err = base64.StdEncoding.DecodeString(jsonBase64)
			if err != nil {
				return nil, err
			}
			jsonStr = string(data)
		}

		// not doing this now, but not removing it either
		// if td.truncateNow {
		// 	jsonStr = td.truncateNowSample(jsonStr)
		// }

		response := &backend.DataResponse{}

			// {"_data":[
			// 		[1623706800,[255.83333333333,8,299]]
			// 	],
			// 	"_end":1623706860,
			// 	"_period":60,
			// 	"_query":"find('duration')",
			// 	"_start":1623706800
			// }

		jsonp.ArrayEach([]byte(jsonStr), func(value []byte, dt jsonp.ValueType, offset int, err error) {
			f, err := strconv.ParseFloat(string(value), 64)
			if err != nil {
				return
			}
			frame := data.NewFrame("response")
			frame.Fields = append(frame.Fields,
				data.NewField("time", nil, []time.Time{q.TimeRange.From, q.TimeRange.To}),
				data.NewField("values", nil, []float64{f, f}))
			response.Frames = append(response.Frames, frame)

			log.DefaultLogger.Info("response frame", "time", []time.Time{q.TimeRange.From, q.TimeRange.To}, "values", []float64{f, f})
		}, "_data", "[0]", "[1]")

		return response, nil
	*/
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (td *SampleDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Data source is working"

	if rand.Int()%2 == 0 {
		status = backend.HealthStatusError
		message = "randomized error"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}

type result struct {
	Query  string        `json:"_query"`
	Data   []interface{} `json:"_data"`
	Start  int64         `json:"_start"`
	End    int64         `json:"_end"`
	Period int64         `json:"_period"`
}

// truncateNowSample removes the last sample in _data if _end within 1s of now -- CIRC-6967
func (td *SampleDatasource) truncateNowSample(jsonData string) string {
	if !td.truncateNow {
		return jsonData
	}
	if jsonData == "" {
		return jsonData
	}

	end, err := jsonp.GetInt([]byte(jsonData), "_end") // epoch ts, end of query time window range
	if err != nil {
		return jsonData
	}

	if time.Now().Unix()-end > 1 {
		return jsonData
	}

	var qr result
	if err := json.Unmarshal([]byte(jsonData), &qr); err != nil {
		return jsonData
	}

	if len(qr.Data) > 0 {
		qr.Data = qr.Data[:len(qr.Data)-1]
		d2, err := json.Marshal(qr)
		if err != nil {
			return jsonData
		}
		return string(d2)
	}

	return jsonData
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
	// Called before creatinga a new instance to allow plugin authors
	// to cleanup.
}
