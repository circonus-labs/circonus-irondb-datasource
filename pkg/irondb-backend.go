package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"math/rand"
	"net/http"
	"net/url"
	"strconv"
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
	im instancemgmt.InstanceManager
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifer).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (td *SampleDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	log.DefaultLogger.Info("QueryData", "request", req)
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
	client, err := circ.New(&circ.Config{TokenKey: key})
	if err != nil {
		return nil, err
	}

	rv := backend.NewQueryDataResponse()
	for _, q := range req.Queries {
		query, err := jsonp.GetString(q.JSON, "query")
		if err != nil {
			return nil, err
		}
		log.DefaultLogger.Info("QueryData", "query", query)

		// https://docs.circonus.com/circonus/api/#/CAQL
		qp := url.Values{}
		qp.Set("query", query)
		path := url.URL{
			Path:     "/v2/caql",
			RawQuery: qp.Encode(),
		}
		// base64-encoded json response body
		jsonBytes, err := client.Get(path.String())
		if err != nil {
			return nil, err
		}
		jsonStr := string(jsonBytes)
		if !strings.HasPrefix(jsonStr, "{") {
			// if it's not a json object, it's base64 encoded
			jsonStr := strings.TrimSpace(jsonStr)
			jsonStr, err = strconv.Unquote(jsonStr)
			if err != nil {
				return nil, err
			}
			jsonBytes, err = base64.StdEncoding.DecodeString(jsonStr)
			if err != nil {
				return nil, err
			}
			jsonStr = string(jsonBytes)
		}

		response := backend.DataResponse{}
		/*
			{"_data":[
					[1623706800,[255.83333333333,8,299]]
				],
				"_end":1623706860,
				"_period":60,
				"_query":"find('duration')",
				"_start":1623706800
			}
		*/
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
		}, "_data", "[0]", "[1]")
		rv.Responses[q.RefID] = response
	}
	log.DefaultLogger.Info("QueryData", "response", rv)
	return rv, nil
}

type queryModel struct {
	Format string `json:"format"`
}

func (td *SampleDatasource) query(ctx context.Context, query backend.DataQuery) backend.DataResponse {
	// Unmarshal the json into our queryModel
	var qm queryModel

	response := backend.DataResponse{}

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	// Log a warning if `Format` is empty.
	if qm.Format == "" {
		log.DefaultLogger.Warn("format is empty. defaulting to time series")
	}

	// create data frame response
	frame := data.NewFrame("response")

	// add the time dimension
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, []time.Time{query.TimeRange.From, query.TimeRange.To}),
	)

	// add values
	frame.Fields = append(frame.Fields,
		data.NewField("values", nil, []int64{10, 20}),
	)

	// add the frames to the response
	response.Frames = append(response.Frames, frame)

	return response
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
