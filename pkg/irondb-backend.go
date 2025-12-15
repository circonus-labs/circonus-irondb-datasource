package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"

	// "net/url"
	// "strings"
	"time"

	jsonp "github.com/buger/jsonparser"
	circ "github.com/circonus-labs/go-apiclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	grafanadata "github.com/grafana/grafana-plugin-sdk-go/data"
	// "github.com/grafana/grafana-plugin-sdk-go/data"
)

type CirconusDatasource struct {
	// The instance manager can help with lifecycle management
	// of datasource instances in plugins. It's not a requirements
	// but a best practice that we recommend that you follow.
	im          instancemgmt.InstanceManager
}

type instanceSettings struct {
	circConfig *circ.Config
	circAPI *circ.API
	httpClient *http.Client
	ID int
	UID string
	Type string
	Name string
	URL string
	User string
	BasicAuthEnabled bool
	BasicAuthUser string
	JSONData json.RawMessage
	DecryptedSecureJSONData map[string]string
	Updated time.Time
}

// newDatasource returns datasource.ServeOpts.
func newDatasource() datasource.ServeOpts {
	// creates a instance manager for your plugin. The function passed
	// into `NewInstanceManger` is called when the instance is created
	// for the first time or when a datasource configuration changed.
	im := datasource.NewInstanceManager(newDataSourceInstance)
	ds := &CirconusDatasource{
		im: im,
	}

	return datasource.ServeOpts{
		QueryDataHandler:   ds,
	}
}

func newDataSourceInstance(setting backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {

	irondbType, err := jsonp.GetString(setting.JSONData, "irondbType")
	if err != nil {
		log.DefaultLogger.Error("unable to get irondbType from configuration JSON",
			"error", err, "JSONData", string(setting.JSONData))
		return nil, fmt.Errorf("unable to get irondbType from configuration JSON: %w", err)
	}
	skipTLSVerify, err := jsonp.GetBoolean(setting.JSONData, "tlsSkipVerify")
	if err != nil {
		skipTLSVerify = false
	}
	// NOTE: The circonus-labs go-apiclient library currently does not support the header X-Circonus-Account.
	// This means it will not work with standalone IronDB instances at this time.
	// Proceeding with a standard HTTP Client for now.
	// circConfig := &circ.Config{
	// 	TokenKey: key,
	// 	TokenApp: "circonus-irondb-datasource",
	// 	URL:      setting.URL,
	// 	// Do not allow the API client to automatically retry on 5XX errors.
	// 	// Grafana is responsible for retry behavior.
	// 	DisableRetries: true,
	// }
	httpConfig := &httpclient.Options{
		Timeouts: &httpclient.TimeoutOptions{
			Timeout: time.Second * 30,
		},
		Headers: map[string]string{
			"Content-Type": "application/json",
			"Accept":       "application/json",
		},
		TLS: &httpclient.TLSOptions{
			InsecureSkipVerify: skipTLSVerify,
		},
	}
	if irondbType != "hosted" {
		accountId, err := jsonp.GetString(setting.JSONData, "accountId")
		if err != nil {
			log.DefaultLogger.Error("unable to get accountId from configuration JSON",
				"error", err, "JSONData", string(setting.JSONData))
			return nil, fmt.Errorf("unable to get accountId from configuration JSON: %w", err)
		}
		httpConfig.Headers["X-Circonus-Account"] = accountId
	} else {
		key, err := jsonp.GetString(setting.JSONData, "apiToken")
		if err != nil {
			log.DefaultLogger.Error("key apiToken missing from configuration JSON",
				"error", err, "JSONData", string(setting.JSONData))
			return nil, fmt.Errorf("apiToken missing from configuration JSON: %w", err)
		}
		httpConfig.Headers["X-Circonus-Auth-Token"] = key
		httpConfig.Headers["X-Circonus-App-Name"] = "circonus-irondb-datasource"
	}

	if setting.BasicAuthEnabled {
		httpConfig.BasicAuth = &httpclient.BasicAuthOptions{
			User: setting.BasicAuthUser,
			Password: setting.DecryptedSecureJSONData["basicAuthPassword"],
		}
	}

	httpClient, err := httpclient.New(*httpConfig)
	if err != nil {
		log.DefaultLogger.Error("unable to create HTTP client", "error", err)
		return nil, fmt.Errorf("unable to create HTTP client: %w", err)
	}

	// if irondbType != "hosted" {
	// 	circConfig.TokenAccountID = accountId
	// }

	// circAPI, err := circ.New(circConfig)
	// if err != nil {
	// 	log.DefaultLogger.Error("unable to create Circonus API client", "error", err)
	// 	return nil, fmt.Errorf("unable to create Circonus API client: %w", err)
	// }

	return &instanceSettings{
		// circConfig: circConfig,
		// circAPI: circAPI,
		httpClient: httpClient,
		ID:                       int(setting.ID),
		UID:                      setting.UID,
		Type:                     setting.Type,
		Name:                     setting.Name,
		URL:                      setting.URL,
		User:                     setting.User,
		BasicAuthEnabled:         setting.BasicAuthEnabled,
		BasicAuthUser:            setting.BasicAuthUser,
		JSONData:                 setting.JSONData,
		DecryptedSecureJSONData:  setting.DecryptedSecureJSONData,
		Updated:                  setting.Updated,
	}, nil
}

func (ds *CirconusDatasource) getSettings(ctx context.Context, pluginContext backend.PluginContext) (*instanceSettings, error) {
	iface, err := ds.im.Get(ctx, pluginContext)
	if err != nil {
		return nil, err
	}

	return iface.(*instanceSettings), nil
}

func (s *instanceSettings) Dispose() {
	// Called before creating a new instance to allow plugin authors
	// to cleanup.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (td *CirconusDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	settings, err := td.getSettings(ctx, req.PluginContext)
	if err != nil {
		log.DefaultLogger.Error("unable to get datasource settings", "error", err)
		return nil, err
	}
	preppedItems, err := td.buildDataRequestItems(req, settings)
	if err != nil {
		return nil, err
	}
	queryResults := td.dataRequest(ctx, req, preppedItems, settings)
	log.DefaultLogger.Info("QueryData completed")
	for refID, resp := range queryResults.Responses {
		log.DefaultLogger.Info("QueryData response", "refID", refID, "frame count", len(resp.Frames), "response", resp)
	}
	// rmut := sync.Mutex{}
	// wg := sync.WaitGroup{}

	// for _, q := range req.Queries {
	// 	wg.Add(1)
	// 	go func(q *backend.DataQuery) {
	// 		defer wg.Done()

	// 		if q == nil {
	// 			return
	// 		}

	// 		var response *backend.DataResponse



	// 		rmut.Lock()
	// 		rv.Responses[q.RefID] = *response
	// 		rmut.Unlock()
	// 	}(&q)
	// }

	// wg.Wait()

	return queryResults, nil
}

type LeafData struct {
	rollupType  string
	metricRollup string
	format      string
	refId       string
	minPeriod   string
	EgressFunction string
	MetricType string `json:"metrictype"`
	metric_name string
	UUID string `json:"uuid"`
	metricLabel string
	check_tags []string
	Name string `json:"name"`
	Type string `json:"type"`
	PanelType string `json:"paneltype"`
	Q backend.DataQuery `json:"q"`
	IsGraphite bool `json:"isGraphite"`
}

type LeafItem struct {
	leaf_name string
	leaf_data LeafData
}

type StdOrCaql struct {
	start int
	end   int
	names []LeafItem
}

type DataRequestItems struct {
	maxDataPoints int
	intervalMs int
	std StdOrCaql
	caql StdOrCaql
}

func (td *CirconusDatasource) buildDataRequestItems(req *backend.QueryDataRequest, settings *instanceSettings) (*DataRequestItems, error) {
	if len(req.Queries) == 0 {
		return &DataRequestItems{}, nil
	}
	start := int(req.Queries[0].TimeRange.From.Unix())
	end := int(req.Queries[0].TimeRange.To.Unix())
	intervalMs := int((req.Queries[0].TimeRange.To.UnixMilli() - req.Queries[0].TimeRange.From.UnixMilli()) / req.Queries[0].MaxDataPoints)

	preppedItems := &DataRequestItems{
		maxDataPoints: int(req.Queries[0].MaxDataPoints),
		intervalMs: intervalMs,
		std: StdOrCaql{
			start: start,
			end:   end,
			names: []LeafItem{},
		},
		caql: StdOrCaql{
			start: start,
			end:   end,
			names: []LeafItem{},
		},
	}
	for _, q := range req.Queries {
		isCaql, err := jsonp.GetBoolean(q.JSON, "isCaql")
		if err != nil {
			log.DefaultLogger.Error("unable to get isCaql from query JSON", "assuming isCaql is false")
			isCaql = false
		}
		queryType, err := jsonp.GetString(q.JSON, "queryType")
		if err != nil {
			log.DefaultLogger.Error("unable to get queryType from query JSON",
				"error", err, "query", string(q.JSON))
			queryType = "caql"
		}
		log.DefaultLogger.Info("buildDataRequestItems", "isCaql", isCaql, "queryType", queryType)
		if isCaql || queryType == "caql" {
			preppedItems = td.buildCaqlItem(q, preppedItems)
		} else {
			preppedItems = td.buildMetricItems(q, preppedItems, start, end, settings)
		}
	}

	log.DefaultLogger.Info("preppedItems std after build", "std names count", len(preppedItems.std.names))
	for _, stdNameItem := range preppedItems.std.names {
		log.DefaultLogger.Info("preppedItems std name item", "leaf_name", stdNameItem.leaf_name, "leaf_data.rollupType", stdNameItem.leaf_data.rollupType, "leaf_data.metricRollup", stdNameItem.leaf_data.metricRollup, "leaf_data.format", stdNameItem.leaf_data.format, "leaf_data.refId", stdNameItem.leaf_data.refId, "leaf_data.minPeriod", stdNameItem.leaf_data.minPeriod)
	}
	return preppedItems, nil
}
func (td *CirconusDatasource) buildMetricItems(q backend.DataQuery, preppedItems *DataRequestItems, start int, end int, settings *instanceSettings) (*DataRequestItems) {
	query, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		log.DefaultLogger.Error("key query missing from metric query",
			"error", err, "query", string(q.JSON))
		return preppedItems
	}
	// query = td.checkVariablesEncoding(query)
	queryType, err := jsonp.GetString(q.JSON, "queryType")
	if err != nil && err != jsonp.KeyPathNotFoundError {
		log.DefaultLogger.Error("unable to get queryType for metric query",
			"error", err, "query", string(q.JSON))
		return preppedItems
	}
	isGraphite := queryType == "graphite"
	tagFilter, err := jsonp.GetString(q.JSON, "tagFilter")
	if err != nil {
		tagFilter = ""
	}
	var response *http.Response
	if isGraphite {
		resultTemp, err := td.metricGraphiteQuery(query, false, start, end, tagFilter, settings)
		if err != nil {
			log.DefaultLogger.Error("error during metricGraphiteQuery",
				"error", err, "query", query)
			return preppedItems
		}
		response = resultTemp
		} else {
		resultTemp, err := td.metricTagsQuery(query, false, start, end, settings)
		if err != nil {
			log.DefaultLogger.Error("error during metricTagsQuery",
				"error", err, "query", query)
			return preppedItems
		}
		response = resultTemp
	}

	defer response.Body.Close()
	responseDataBytes, err := io.ReadAll(response.Body)
	if err != nil {
		log.DefaultLogger.Error("unable to read response body from metric query",
			"error", err, "query", query)
		return preppedItems
	}
	var searchRequestResponse []SearchRequestResponse
	if err := json.Unmarshal(responseDataBytes, &searchRequestResponse); err != nil {
		log.DefaultLogger.Error("unable to unmarshal searchRequestResponse data", "error", err, "response", string(responseDataBytes))
		return preppedItems
	}


	filteredResults := []SearchRequestResponse{}
	for _, metric := range searchRequestResponse {
		metricTypeStr := ""
		if metric.Type != "" {
			metricTypeStr = metric.Type
		}
		metricTypes := strings.Split(metricTypeStr, ",")
		if !td.includes(metricTypes, "text") {
			filteredResults = append(filteredResults, metric)
		}
	}
	log.DefaultLogger.Info("buildMetricItems", "filteredResults", filteredResults)
	for i, d := range filteredResults {
		d.Target = q
		preppedItems.std.names = append(preppedItems.std.names, td.buildFetchStream(q, filteredResults, i, isGraphite))
	}

	return preppedItems
}

func (td *CirconusDatasource) buildFetchStream(q backend.DataQuery, results []SearchRequestResponse, index int, isGraphite bool) LeafItem {
	leafName := results[index].MetricName
	if leafName == "" {
		leafName = results[index].Name
	}
	leafUUID := results[index].LeafData.UUID
	leafMetricName := results[index].LeafData.Name

	baseType := results[index].MetricType
	if baseType == "" {
		baseType = results[index].Type
	}
	if baseType == "" {
		baseType = results[index].LeafData.MetricType
	}
	if baseType == "" {
		baseType = results[index].LeafData.Type
	}
	format, err := jsonp.GetString(q.JSON, "format")
	if err != nil {
		log.DefaultLogger.Error("unable to get format from query JSON",
			"error", err, "query", string(q.JSON))
		format = "ts"
	}
	if format == "heatmap" {
		baseType = "histogram"
	}
	typesStr := "numeric"
	if baseType != "" {
		typesStr = baseType
	}
	types := strings.Split(typesStr, ",")
	uuid := leafUUID
	if uuid == "" {
		uuid = results[index].UUID
	}
	results[index].LeafData = LeafData{
		EgressFunction: "average",
		UUID: uuid,
		metric_name: leafMetricName,
		MetricType: types[0],
		Q: q,
		IsGraphite: isGraphite,
		refId: q.RefID,
	}

	eggressOverride, err := jsonp.GetString(q.JSON, "egressOverride")
	if err != nil {
		eggressOverride = ""
	}
	if types[0] == "histogram" {
		eggressOverride = "histogram"
	}
	if eggressOverride != "" && eggressOverride != "average" {
		if eggressOverride == "automatic" {
			if td.isStatsdCounter(leafName) {
				results[index].LeafData.EgressFunction = "counter"
			}
		} else {
			results[index].LeafData.EgressFunction = eggressOverride
		}
	}

	metricLabel, err := jsonp.GetString(q.JSON, "metricLabel")
	if err != nil {
		metricLabel = ""
	}
	labelType, err := jsonp.GetString(q.JSON, "labelType")
	if err != nil {
		labelType = ""
	}

	if labelType == "default" {
		metricLabel = "%n | %t{*}"
	} else if labelType == "name" {
		metricLabel = "%n"
	} else if labelType == "cardinality" {
		metricLabel = "%n | %t-{*}"
	}
	interpolatedLabel := td.metaInterpolateLabel(metricLabel, results, index)
	results[index].LeafData.metricLabel = interpolatedLabel
	results[index].LeafData.check_tags = results[index].CheckTags

	rollupType, err := jsonp.GetString(q.JSON, "rollupType")
	if err != nil {
		rollupType = "automatic"
	}
	metricRollup, err := jsonp.GetString(q.JSON, "metricRollup")
	if err != nil {
		metricRollup = ""
	}

	if rollupType != "automatic"  && metricRollup != "" {
		results[index].LeafData.rollupType = rollupType
		results[index].LeafData.metricRollup = metricRollup
	}
	return LeafItem{
		leaf_name: leafName,
		leaf_data: results[index].LeafData,
	}
}

func (td *CirconusDatasource) metaInterpolateLabel(metricLabel string, results []SearchRequestResponse, index int) string {
	meta := results[index]
	label := strings.ReplaceAll(metricLabel, "%d", strconv.Itoa(index + 1))
	taglessNameParam := meta.LeafData.metric_name
	if taglessNameParam == "" {
		taglessNameParam = meta.MetricName
	}
	if taglessNameParam == "" {
		taglessNameParam = meta.Name
	}
	displayName := td.taglessName(taglessNameParam)
	label = strings.ReplaceAll(label, "%n", displayName)
	labelReplacement := meta.MetricName
	if labelReplacement == "" {
		labelReplacement = meta.Name
	}
	label = strings.ReplaceAll(label, "%cn", labelReplacement)
	taglessNameAndTagsParam := meta.MetricName
	if taglessNameAndTagsParam == "" {
		taglessNameAndTagsParam = meta.Name
	}

	stream_tags := td.taglessNameAndTags(taglessNameAndTagsParam)[1]
	tagSet := td.splitTags(stream_tags, true)
	tagLoop := meta.CheckTags
	for _, tag := range tagLoop {
		tagSep := strings.Split(tag, ":")
		tagCat, newTagSep := td.Shift(tagSep)
		tagSep = newTagSep
		if !strings.HasPrefix(tagCat, "__") && tagCat != "" {
			tagVal := strings.Join(tagSep, ":")
			tagCat = td.decodeTag(tagCat)
			tagVal = td.decodeTag(tagVal)
			_, exists := tagSet[tagCat]
			if exists == false {
				tagSet[tagCat] = []string{}
			}
			tagSet[tagCat] = append(tagSet[tagCat], tagVal)
		}
	}

	// case %tv
	tvPattern := regexp.MustCompile(`%tv-?{[^}]*}`)
	label = tvPattern.ReplaceAllStringFunc(label, func(match string) string {
		elide := match[3]
		choose := td.returnTrue
		if elide == '-' {
			choose = td.metaTagDiff
		}
		tagSubstringStart := 4
		if elide == '-' {
			tagSubstringStart = 5
		}
		tag := match[tagSubstringStart : len(match)-1]
		if tag == "*" {
			tagCats := []string{}
			for k := range tagSet {
				if !strings.HasPrefix(k, "__") && k != "" && choose(results, k) {
					tagCats = append(tagCats, k)
				}
			}
			sort.Strings(tagCats)
			tagVals := []string{}
			for _, tagCat := range tagCats {
				tagVals = append(tagVals, tagSet[tagCat][0])
			}
			return strings.Join(tagVals, ",")
		}
		if tagSet[tag] != nil && tag != "" && choose(results, tag) {
			return tagSet[tag][0]
		}
		return ""
	})

	// case %t
	tPattern := regexp.MustCompile(`%t-?{[^}]*}`)
	label = tPattern.ReplaceAllStringFunc(label, func(match string) string {
		elide := match[2]
		choose := td.returnTrue
		if elide == '-' {
			choose = td.metaTagDiff
		}
		tagSubstringStart := 3
		if elide == '-' {
			tagSubstringStart = 4
		}
		tag := match[tagSubstringStart : len(match)-1]
		if tag == "*" {
			tagCats := []string{}
			for k := range tagSet {
				if !strings.HasPrefix(k, "__") && k != "" && choose(results, k) {
					v := tagSet[k][0]
					tagCats = append(tagCats, k + ":" + v)
				}
			}
			sort.Strings(tagCats)
			return strings.Join(tagCats, ",")
		}
		if tagSet[tag] != nil && tag != "" && choose(results, tag) {
			return tag + ":" + tagSet[tag][0]
		}
		return ""
	})
	return label
}

func (td *CirconusDatasource) metaTagDiff(results []SearchRequestResponse, tag string) bool {
	keycnt := 0
	seen := map[string]bool{}

	for i, _ := range results {
		meta := results[i]
		tags := td.taglessNameAndTags(meta.MetricName)[1]
		tagSet := td.splitTags(tags, true)
		for _, tag := range meta.CheckTags {
			tagSep := strings.Split(tag, ":")
			tagCat, newTagSep := td.Shift(tagSep)
			tagSep = newTagSep
			if !strings.HasPrefix(tagCat, "__") && tagCat != "" {
				tagVal := strings.Join(tagSep, ":")
				tagCat = td.decodeTag(tagCat)
				tagVal = td.decodeTag(tagVal)
				_, exists := tagSet[tagCat]
				if exists == false {
					tagSet[tagCat] = []string{}
				}
				tagSet[tagCat] = append(tagSet[tagCat], tagVal)
			}
		}
		mtag := ""
		if tag != "" && tagSet[tag] != nil {
			mtag = tagSet[tag][0]
		}
		_, exists := seen[mtag]
		if !exists {
			keycnt += 1
		}
		seen[mtag] = true
	}
	return keycnt > 1
}

func (td *CirconusDatasource) returnTrue(results []SearchRequestResponse, tag string) bool {
	return true
}

type SearchRequestResponse struct {
	Leaf bool `json:"leaf"`
	Name string `json:"name"`
	LeafData LeafData `json:"leaf_data"`
	Type string `json:"type"`
	Target backend.DataQuery `json:"target"`
	MetricName string `json:"metric_name"`
	MetricType string `json:"metric_type"`
	UUID string `json:"uuid"`
	CheckTags []string `json:"check_tags"`
}

type DataResponse struct {
	data []int
}

func (td *CirconusDatasource) metricTagsQuery(query string, allowEmptyWildcard bool, start int, end int, settings *instanceSettings) (*http.Response, error) {
	if query == "" || (!allowEmptyWildcard && query == "and(__name:*)") {
		return nil, nil
	}
	queryUrl := "/find" + td.getAccountIdForApiPath(settings) + "/tags?query=" + query
	activityTracking, err := jsonp.GetBoolean(settings.JSONData, "activityTracking")
	if err != nil {
		activityTracking = false
	}
	if activityTracking {
		queryUrl += "&activity_start_secs=" + strconv.Itoa(start)
		queryUrl += "&activity_end_secs=" + strconv.Itoa(end)
	}
	return td.searchRequest(queryUrl, true, false, settings)
}

func (td *CirconusDatasource) getAccountIdForApiPath(settings *instanceSettings) string {
	irondbType, err := jsonp.GetString(settings.JSONData, "irondbType")
	if err != nil {
		log.DefaultLogger.Error("unable to get irondbType from configuration JSON",
			"error", err, "JSONData", string(settings.JSONData))
		return ""
	}
	if irondbType == "standalone" {
		accountId, err := jsonp.GetString(settings.JSONData, "accountId")
		if err != nil {
			log.DefaultLogger.Error("unable to get accountId from configuration JSON",
				"error", err, "JSONData", string(settings.JSONData))
			return ""
		}
		return "/" + accountId
	} else {
		return ""
	}
}

// customLimit portion was not included because it is only used in the metricFindQuery function of TS which is not necessary to port over
func (td *CirconusDatasource) metricGraphiteQuery(query string, ignoreLimit bool, start int, end int, tagFilter string, settings *instanceSettings) (*http.Response, error) {
	ignoreUUIDs := td.ignoreGraphiteUUIDs(settings)
	queryPrefix, err := jsonp.GetString(settings.JSONData, "queryPrefix")
	if err != nil {
		queryPrefix = ""
	}
	queryUrl := "/" + queryPrefix + "/metrics/find"
	ignoreUUIDsStr := ""
	if ignoreUUIDs {
		ignoreUUIDsStr = "*."
	}
	qsParam1 := "query=" + ignoreUUIDsStr + query
	qsParams := []string{qsParam1, "activity=0", "include_type=1"}
	if tagFilter != "" {
		qsParams = append(qsParams, "irondb_tag_filter=" + tagFilter)
	}
	queryUrl += "?" + strings.Join(qsParams, "&")
	followLimit := !ignoreLimit
	return td.searchRequest(queryUrl, followLimit, true, settings)
}

func (td *CirconusDatasource) searchRequest(url string, followLimit bool, isGraphite bool, settings *instanceSettings) (*http.Response, error) {
	isCaql := false
	isFind := true
	resultsLimitStr, err := jsonp.GetString(settings.JSONData, "resultsLimit")
	if err != nil {
		log.DefaultLogger.Info("unable to get resultsLimit from configuration JSON. Using 100 as default.",
			"error", err, "JSONData", string(settings.JSONData))
		resultsLimitStr = "100" // default
	}
	limit, err := strconv.Atoi(resultsLimitStr)
	if err != nil {
		limit = 100 // default
	}
	baseUrl := settings.URL
	XSnowthAdvisoryLimit := 100
	if followLimit {
		XSnowthAdvisoryLimit = int(limit)
	}
	headers := &Headers{
		ContentType:        "application/json",
		XSnowthAdvisoryLimit: XSnowthAdvisoryLimit,
	}

	irondbType, err := jsonp.GetString(settings.JSONData, "irondbType")
	if err != nil {
		log.DefaultLogger.Error("unable to get irondbType from configuration JSON",
			"error", err, "JSONData", string(settings.JSONData))
		return nil, err
	}

	accountId, err := jsonp.GetString(settings.JSONData, "accountId")
	if err != nil {
		log.DefaultLogger.Error("unable to get accountId from configuration JSON",
			"error", err, "JSONData", string(settings.JSONData))
		return nil, err
	}

	if irondbType != "hosted" {
		// headers.XCirconusAccount = accountId
	} else if irondbType == "hosted" && !isCaql {
		graphiteStr := ""
		if isGraphite {
			graphiteStr = "/graphite"
		}
		baseUrl += "/irondb" + graphiteStr
		if !isFind {
			baseUrl += "/series_multi"
		}

		// apiToken, err := jsonp.GetString(settings.JSONData, "apiToken")
		// if err != nil {
		// 	log.DefaultLogger.Error("unable to get apiToken from configuration JSON",
		// 		"error", err, "JSONData", string(settings.JSONData))
		// 	return nil, err
		// }

		// headers.XCirconusAuthToken = apiToken
		// headers.XCirconusAppName = "Grafana"
	}
	if irondbType == "standalone" && !isCaql {
		if isGraphite {
			baseUrl += "/graphite/" + accountId
			if !isFind {
				queryPrefix, err := jsonp.GetString(settings.JSONData, "queryPrefix")
				if err != nil {
					queryPrefix = ""
				}
				baseUrl += "/" + queryPrefix + "/series_multi"
			}
		} else if !isFind {
			baseUrl += "/series_multi"
		}
	}
	if isCaql && !isFind {
		baseUrl += "/extension/lua/caql_v1"
	}
	options := &RequestOptions{
		url: baseUrl + url,
		method: "GET",
		headers: headers,
		retry: 1,
	}
	log.DefaultLogger.Info("searchRequest query url", "url", options.url)
	return settings.httpClient.Get(options.url)
}

func (td *CirconusDatasource) ignoreGraphiteUUIDs(settings *instanceSettings) bool {
	queryPrefix, err := jsonp.GetString(settings.JSONData, "queryPrefix")
	if err != nil {
		queryPrefix = ""
	}
	queryPrefix = strings.TrimSpace(queryPrefix)
	return queryPrefix == ""
}

// func (td *CirconusDatasource) checkVariablesEncoding(query string) (string) {
// 	return query
// }

func (td *CirconusDatasource) buildCaqlItem(q backend.DataQuery, preppedItems *DataRequestItems) (*DataRequestItems) {
	query, err := jsonp.GetString(q.JSON, "query")
	if err != nil {
		log.DefaultLogger.Error("key query missing from CAQL query",
			"error", err, "query", string(q.JSON))
		return preppedItems
	}
	rollupType, err := jsonp.GetString(q.JSON, "rollupType")
	if err != nil && err != jsonp.KeyPathNotFoundError {
		log.DefaultLogger.Error("unable to get rollupType for CAQL query",
			"error", err, "query", string(q.JSON))
		return preppedItems
	}
	metricRollup, err := jsonp.GetString(q.JSON, "metricRollup")
	if err != nil && err != jsonp.KeyPathNotFoundError {
		log.DefaultLogger.Error("unable to get metricRollup for CAQL query",
			"error", err, "query", string(q.JSON))
		return preppedItems
	}
	format, err := jsonp.GetString(q.JSON, "format")
	if err != nil && err != jsonp.KeyPathNotFoundError {
		log.DefaultLogger.Error("unable to get format for CAQL query",
			"error", err, "query", string(q.JSON))
		return preppedItems
	}
	refId := q.RefID
	minPeriod, err := jsonp.GetString(q.JSON, "minPeriod")
	if err != nil && err != jsonp.KeyPathNotFoundError {
		log.DefaultLogger.Error("unable to get minPeriod for CAQL query",
			"error", err, "query", string(q.JSON))
		return preppedItems
	}

	preppedItems.caql.names = append(preppedItems.caql.names, LeafItem{
		leaf_name: query,
		leaf_data: LeafData{
			rollupType:  rollupType,
			metricRollup: metricRollup,
			format:      format,
			refId:       refId,
			minPeriod:   minPeriod,
		},
	})
	return preppedItems
}

type QueryResults struct {
	data []any
	t string
}

type Headers struct {
	ContentType string `json:"Content-Type"`
	XSnowthAdvisoryLimit int `json:"X-Snowth-Advisory-Limit"`
	Accept string `json:"Accept"`
	XCirconusAuthToken string `json:"X-Circonus-Auth-Token"`
	XCirconusAppName string `json:"X-Circonus-App-Name"`
	XCirconusAccount string `json:"X-Circonus-Account"`
	Authorization string `json:"Authorization"`
}

type RequestOptions struct {
	url string
	method string
	name string
	headers *Headers
	// withCredentials bool
	panelType string
	format string
	isCaql bool
	isGraphite bool
	retry int
	data *RequestOptionsData
	metricLabels []string
	check_tags [][]string
	start float64
	end float64
	refId string
}

type RequestOptionsData struct {
	Streams []Stream `json:"streams"`
	Period float64 `json:"period"`
	Start float64 `json:"start"`
	End float64 `json:"end,omitempty"`
	Count int `json:"count"`
	Reduce []RequestOptionsDataReduce `json:"reduce"`
	Format string `json:"format,omitempty"`
	Q string `json:"q,omitempty"`
}

type RequestOptionsDataReduce struct {
	Label string `json:"label"`
	Method string `json:"method"`
}

func (td *CirconusDatasource) dataRequest(ctx context.Context, req *backend.QueryDataRequest, preppedItems *DataRequestItems, settings *instanceSettings) *backend.QueryDataResponse {
	finalResponse := &backend.QueryDataResponse{
		Responses: map[string]backend.DataResponse{},
	}
	queries := []*RequestOptions{}

	resultsLimitStr, err := jsonp.GetString(settings.JSONData, "resultsLimit")
	if err != nil {
		log.DefaultLogger.Info("unable to get resultsLimit from configuration JSON. Using 100 as default.",
			"error", err, "JSONData", string(settings.JSONData))
		resultsLimitStr = "100" // default
	}
	resultsLimit, err := strconv.Atoi(resultsLimitStr)
	if err != nil {
		resultsLimit = 100 // default
	}
	headers := &Headers{
		ContentType:        "application/json",
		Accept:             "application/json",
		XSnowthAdvisoryLimit: resultsLimit,
	}
	irondbType, err := jsonp.GetString(settings.JSONData, "irondbType")
	if err != nil {
		log.DefaultLogger.Error("unable to get irondbType from configuration JSON",
			"error", err, "JSONData", string(settings.JSONData))
		return nil
	}
	if irondbType == "hosted" {
		apiToken, err := jsonp.GetString(settings.JSONData, "apiToken")
		if err != nil {
			log.DefaultLogger.Error("unable to get apiToken from configuration JSON",
				"error", err, "JSONData", string(settings.JSONData))
			return nil
		}
		headers.XCirconusAuthToken = apiToken
		headers.XCirconusAppName = "Grafana"
	} else {
		accountId, err := jsonp.GetString(settings.JSONData, "accountId")
		if err != nil {
			log.DefaultLogger.Error("unable to get accountId from configuration JSON",
				"error", err, "JSONData", string(settings.JSONData))
			return nil
		}
		headers.XCirconusAccount = accountId
	}

	if len(preppedItems.std.names) > 0 {
		leafData := preppedItems.std.names[0].leaf_data
		panelType := "ts"
		if leafData.format != "" {
			panelType = leafData.format
		}
		for _, stdNameItem := range preppedItems.std.names {
			thisLeafData := stdNameItem.leaf_data
			options := &RequestOptions{
				url: settings.URL,
				method: "POST",
				name: "fetch",
				headers: headers,
				// withCredentials: false,
				panelType: panelType,
				format: thisLeafData.format,
				isCaql: false,
				isGraphite: false,
				retry: 1,
				refId: thisLeafData.refId,
			}
			if irondbType == "hosted" {
				options.url += "/irondb"
			}
			options.url += "/fetch"
			start := float64(preppedItems.std.start)
			end := float64(preppedItems.std.end)
			interval := td.getRollupSpan(preppedItems, int(start), int(end), false, stdNameItem.leaf_data)

			minTruncation, err := jsonp.GetInt(settings.JSONData, "minTruncation")
			if err != nil {
				minTruncation = 0
			}

			end_shift := td.max([]float64{interval, float64(minTruncation)})
			ends_now := float64(time.Now().UnixMilli()) - end * 1000 < 1000
			start -= interval
			truncateNow, _ := jsonp.GetBoolean(settings.JSONData, "truncateNow")
			if ends_now && truncateNow{
				end = end - end_shift
			} else {
				end = end + interval
			}
			streams := []Stream{}
			method := "pass"
			if panelType == "heatmap" {
				method = "merge"
			}
			transform := thisLeafData.EgressFunction
			if thisLeafData.MetricType == "histogram" {
				if panelType == "heatmap" {
					transform = "none"
				} else {
					transform = td.histogramTransforms(transform)
					leafName := stdNameItem.leaf_name
					tranformMode := "default"
					if td.isStatsdCounter(leafName) {
						tranformMode = "statsd_counter"
					}
					// BSR TBD: implement leafData.target field if needed
					log.DefaultLogger.Info("tranformMode for histogram", "tranformMode", tranformMode)
					// thisLeafData.target.hist_transform = tranformMode
				}
			}
			name := thisLeafData.metric_name
			if name == "" {
				name = stdNameItem.leaf_name
			}
			stream := &Stream{
				Transform: transform,
				Name: name,
				UUID: thisLeafData.UUID,
				Kind: thisLeafData.MetricType,
			}
			if stream.UUID != "" {
				streams = append(streams, *stream)
			}
			data := &RequestOptionsData{
				Streams: streams,
				Period: interval,
				Start: start,
				Count: int((end - start) / interval),
				Reduce: []RequestOptionsDataReduce{{Label: "", Method: method}},
			}
			options.data = data
			options.metricLabels = []string{thisLeafData.metricLabel}
			options.check_tags = [][]string{thisLeafData.check_tags}
			if (settings.BasicAuthEnabled) {
				options.headers.Authorization = "Basic " + base64.StdEncoding.EncodeToString([]byte(settings.BasicAuthUser + ":" + settings.DecryptedSecureJSONData["basicAuthPassword"]))
			}
			queries = append(queries, options)
		}
	}

	if len(preppedItems.caql.names) > 0 {
		for _, caqlNameItem := range preppedItems.caql.names {
			options := &RequestOptions{
				url: settings.URL,
				method: "POST",
				data: nil,
				headers: headers,
				start: float64(preppedItems.caql.start),
				end: float64(preppedItems.caql.end),
				retry: 1,
				isCaql: true,
				name: caqlNameItem.leaf_name,
				format: caqlNameItem.leaf_data.format,
				refId: caqlNameItem.leaf_data.refId,
			}
			if irondbType == "hosted" {
				options.url += "/irondb"
			}
			options.url += "/extension/lua"
			if irondbType == "hosted" {
				options.url += "/public"
			}
			options.url += "/caql_v1"
			caqlQuery := caqlNameItem.leaf_name
			minPeriod := caqlNameItem.leaf_data.minPeriod

			caqlQueryMP := ""
			if minPeriod != "" && !strings.HasPrefix(caqlQuery, "#min_period=") {
				caqlQueryMP = "#min_period=" + minPeriod + " "
			}
			caqlQueryMP += caqlQuery

			re := regexp.MustCompile(`(?i)#min_period=(\d+\w{0,2}?)\s`)
    	minPeriodMatches := re.FindStringSubmatch(caqlQueryMP)
			minPeriodDirective := 0
			if len(minPeriodMatches) > 1 {
				parseDurationMs, err := td.parseDurationMS(minPeriodMatches[1])
				if err != nil {
					log.DefaultLogger.Error("unable to parse min_period duration",
						"error", err, "min_period", minPeriodMatches[1])
					continue
				}
				minPeriodDirective = parseDurationMs / 1000
			}
			calculatedInterval := td.getRollupSpan(preppedItems, int(options.start), int(options.end), true, caqlNameItem.leaf_data)
			MIN_DURATION_MS_CAQL := 60000
			intervalIsMin := int(calculatedInterval) == MIN_DURATION_MS_CAQL / 1000
			interval := calculatedInterval
			if minPeriodDirective != 0 && intervalIsMin {
				interval = td.min([]float64{float64(minPeriodDirective), calculatedInterval})
			}
			minTruncation, err := jsonp.GetInt(settings.JSONData, "minTruncation")
			if err != nil {
				minTruncation = 0
			}
			end_shift := td.max([]float64{interval, float64(minTruncation)})
			ends_now := float64(time.Now().UnixMilli()) - options.end * 1000 < 1000
			options.start -= interval
			truncateNow, err := jsonp.GetBoolean(settings.JSONData, "truncateNow")
			if err != nil {
				truncateNow = false
			}
			options.end = options.end + interval
			if ends_now && truncateNow {
				options.end = options.end - end_shift
			}
			caqlRequestData := &RequestOptionsData{
				Start: options.start,
				End:   options.end,
				Period: interval,
				Format: "DF4",
				Q: caqlQueryMP,
			}
			options.data = caqlRequestData
			queries = append(queries, options)
		}
	}

	queryResponses := map[string][]DF4GrafanaData{}
	for _, query := range queries {
		log.DefaultLogger.Info("Prepared Query", "query.url", query.url, "method", query.method, "isCaql", query.isCaql, "data", query.data)
		reqBody, err := td.buildBody(query.data)
		if err != nil {
			queryResponses[query.refId] = append(queryResponses[query.refId], DF4GrafanaData{
				Error: fmt.Errorf("error building request body: %v", err),
				Status: 0,
			})
			// finalResponse.Responses[query.refId] = backend.DataResponse{
			// 	Error: fmt.Errorf("error building request body: %v", err),
			// }
			continue
		}
		var response *http.Response
		if query.method == "POST" {
			response, err = settings.httpClient.Post(query.url, "application/json", reqBody)
		} else if query.method == "GET" {
			response, err = settings.httpClient.Get(query.url)
		}
		if err != nil {
			log.DefaultLogger.Error("error during dataRequest", "error", err, "query.url", query.url)
			queryResponses[query.refId] = append(queryResponses[query.refId], DF4GrafanaData{
				Error: fmt.Errorf("error during dataRequest: %v", err),
				Status: response.StatusCode,
			})
			// finalResponse.Responses[query.refId] = backend.DataResponse{
			// 	Status: backend.Status(response.StatusCode),
			// 	Error: fmt.Errorf("error during dataRequest: %v", err),
			// }
			continue
		}

		defer response.Body.Close()

		log.DefaultLogger.Info("dataRequest response", "response.Status", response.Status, "response.StatusCode", response.StatusCode)

		responseDataBytes, err := io.ReadAll(response.Body)
		if err != nil {
			log.DefaultLogger.Error("error reading response body", "error", err, "query.url", query.url)
			queryResponses[query.refId] = append(queryResponses[query.refId], DF4GrafanaData{
				Error: fmt.Errorf("error reading response body: %v", err),
				Status: response.StatusCode,
			})
			// finalResponse.Responses[query.refId] = backend.DataResponse{
			// 	Status: backend.Status(response.StatusCode),
			// 	Error: fmt.Errorf("error reading response body: %v", err),
			// }
			continue
		}
		var responseData ResponseData
		if err := json.Unmarshal(responseDataBytes, &responseData); err != nil {
			log.DefaultLogger.Error("unable to unmarshal response data", "error", err, "response", string(responseDataBytes))
			queryResponses[query.refId] = append(queryResponses[query.refId], DF4GrafanaData{
				Error: fmt.Errorf("error unable to unmarshal response data: %v", err),
				Status: response.StatusCode,
			})
			// finalResponse.Responses[query.refId] = backend.DataResponse{
			// 	Status: backend.Status(response.StatusCode),
			// 	Error: fmt.Errorf("error unable to unmarshal response data: %v", err),
			// }
			continue
		}
		log.DefaultLogger.Info("responseData", "responseData", responseData, "query.refId", query.refId)

		hideCAQLWarnings, err := jsonp.GetBoolean(settings.JSONData, "hideCAQLWarnings")
		if err != nil {
			hideCAQLWarnings = false
		}
		if query.isCaql && len(responseData.Head.Warning) > 0 && !hideCAQLWarnings {
			log.DefaultLogger.Warn("CAQL Warning", "warning", responseData.Head.Warning, "Graph not rendered. To render the potentially incomplete data, check \"Hide CAQL Warnings\" in the datasource settings.")
			queryResponses[query.refId] = append(queryResponses[query.refId], DF4GrafanaData{
				Error: fmt.Errorf("CAQL Warning: %s. Graph not rendered. To render the potentially incomplete data, check \"Hide CAQL Warnings\" in the datasource settings", strings.Join(responseData.Head.Warning, "\n")),
				Status: response.StatusCode,
			})
			// finalResponse.Responses[query.refId] = backend.DataResponse{
			// 	Error: fmt.Errorf("CAQL Warning: %s. Graph not rendered. To render the potentially incomplete data, check \"Hide CAQL Warnings\" in the datasource settings", strings.Join(responseData.Head.Warning, "\n")),
			// 	Status: backend.Status(response.StatusCode),
			// }
			continue
		}

		var convertedResponse DF4Response
		convertedResponse, err = td.convertIrondbDf4DataToGrafana(responseData, query)
		if err != nil {
			log.DefaultLogger.Error("error converting Irondb DF4 data to Grafana format", "error", err, "query.url", query.url)
			queryResponses[query.refId] = append(queryResponses[query.refId], DF4GrafanaData{
				Error: fmt.Errorf("error converting Irondb DF4 data to Grafana format: %v", err),
				Status: response.StatusCode,
			})
			// finalResponse.Responses[query.refId] = backend.DataResponse{
			// 	Error: err,
			// 	Status: backend.Status(response.StatusCode),
			// }
			continue
		}
		queryResponses[query.refId] = append(queryResponses[query.refId], DF4GrafanaData{
			DataFrames: convertedResponse.DataFrames,
			Status: response.StatusCode,
		})
		// finalResponse.Responses[query.refId] = backend.DataResponse{
		// 	Frames: convertedResponse.DataFrames,
		// 	Status: backend.Status(response.StatusCode),
		// }
	}

	for refId, respArr := range queryResponses {
		log.DefaultLogger.Info("testing queryResponses", "refId", refId, "respArr", respArr, "len(respArr)", len(respArr))
		errorCount := 0
		for _, resp := range respArr {
			if resp.Error != nil {
				errorCount += 1
			}
		}
		if errorCount == len(respArr) {
			finalResponse.Responses[refId] = backend.DataResponse{
				Error: respArr[0].Error,
			}
			continue
		}
		allFrames := []*grafanadata.Frame{}
		for _, resp := range respArr {
			allFrames = append(allFrames, resp.DataFrames...)
		}
		finalResponse.Responses[refId] = backend.DataResponse{
			Frames: allFrames,
			Status: backend.Status(respArr[0].Status),
		}
	}

	log.DefaultLogger.Info("finalResponse", "finalResponse.Responses", finalResponse.Responses)
	return finalResponse
}

type DF4GrafanaData struct {
	DataFrames []*grafanadata.Frame `json:"dataframes"`
	Error error `json:"error"`
	Status int `json:"status"`
}

type DF4Response struct {
	DataFrames []*grafanadata.Frame `json:"dataframes"`
	query RequestOptions
	t string
}

type DF4ResponseData struct {
	Length int `json:"length"`
	Fields []*grafanadata.Field `json:"fields"`
	Target string `json:"target"`
}

type LookasideObject struct {
	Target string `json:"target"`
	Title string `json:"title"`
	Tags map[string]string `json:"tags"`
	Datapoints []int `json:"datapoints"`
	Ts map[string][]int `json:"ts"`
}


func (td *CirconusDatasource) convertIrondbDf4DataToGrafana(responseData ResponseData, query *RequestOptions) (DF4Response, error) {
	name := query.name
	metricLabels := []string{}
	if len(query.metricLabels) > 0 {
		metricLabels = query.metricLabels
	}
	check_tags := query.check_tags
	data := responseData.Data
	meta := responseData.Meta
	start := responseData.Head.Start
	period := responseData.Head.Period
	error := []string{}
	if len(responseData.Head.Error) > 0 {
		error = responseData.Head.Error
	}
	format := "ts"
	if query.format != "" {
		format = query.format
	}

	if len(error) > 0 {
		log.DefaultLogger.Error("error in response data head", "error", error, "query.name", name)
		return DF4Response{}, fmt.Errorf("error in response data head: %s", strings.Join(error, "\n"))
	}
	if len(data) == 0 {
		log.DefaultLogger.Info("no data returned from query", "query.name", name)
		return DF4Response{}, nil
	}
	// if format == "table" {
	// 	timeField := grafanadata.NewField("Time", nil, []time.Time{})
	// 	valueField := []*grafanadata.Field{}
	// 	labelField := []*grafanadata.Field{}
	// 	allLabels := map[string]*grafanadata.Field{}
	// 	allValues := map[string]*grafanadata.Field{}

	// 	for rowIndex := range data[0] {
	// 		ts := (start + rowIndex * period) * 1000
	// 		log.DefaultLogger.Info("Appending data point", "ts", strconv.Itoa(ts))
	// 		if ts < int(query.start) * 1000 {
	// 			continue
	// 		}

	// 		for si := range data {
	// 			timeField.Append(time.UnixMilli(int64(ts)))
	// 			siPlus1 := si + 1
	// 			siPlus1Str := strconv.Itoa(siPlus1)
	// 			dummy := name + " [" + siPlus1Str + "]"
	// 			lname := dummy
	// 			tags := []string{}
	// 			if len(meta) > si {
	// 				lname = meta[si].Label
	// 				tags = meta[si].Tags
	// 			}
	// 			lname = td.taglessName(lname)
	// 			metricLabel := ""
	// 			if len(metricLabels) > si {
	// 				metricLabel = metricLabels[si]
	// 				lname = metricLabel
	// 			}

	// 			if len(check_tags) > si {
	// 				if len(tags) == 0 {
	// 					tags = check_tags[si]
	// 				} else {
	// 					tags = append(tags, check_tags[si]...)
	// 				}
	// 			}
	// 			if len(tags) > 0 {
	// 				for _, tag := range tags {
	// 					tagSep := strings.Split(tag, ":")
	// 					tagCat, newTagSep := td.Shift(tagSep)
	// 					tagSep = newTagSep
	// 					tagVal := strings.Join(tagSep, ":")
	// 					if !strings.HasPrefix(tagCat, "__") {
	// 						tagCat = td.decodeTag(tagCat)
	// 						tagVal = td.decodeTag(tagVal)
	// 						_, ok := allLabels[tagCat]
	// 						if !ok {
	// 							lfield := grafanadata.NewField(tagCat, nil, []string{})
	// 							allLabels[tagCat] = lfield
	// 							labelField = append(labelField, lfield)
	// 						}
	// 						lfield := allLabels[tagCat]
	// 						lfield.Append(tagVal)
	// 					}
	// 				}
	// 			}
	// 			_, ok := allValues[lname]
	// 			if !ok {
	// 				vfield := grafanadata.NewField(lname, nil, []float64{})
	// 				allValues[lname] = vfield
	// 				valueField = append(valueField, vfield)
	// 			}
	// 			vfield := allValues[lname]
	// 			if len(data[si]) > rowIndex {
	// 				vfield.Append(data[si][rowIndex])
	// 			} else {
	// 				vfield.Append(nil)
	// 			}
	// 		}
	// 	}

	// 	finalResponse := DF4Response{
	// 		data: DF4ResponseData{
	// 			Length: timeField.Len(),
	// 			Fields: []*grafanadata.Field{timeField},
	// 		},
	// 		t: "table",
	// 	}
	// 	finalResponse.data.Fields = append(finalResponse.data.Fields, labelField...)
	// 	finalResponse.data.Fields = append(finalResponse.data.Fields, valueField...)
	// 	return finalResponse, nil
	// }

	dataFrames := []*grafanadata.Frame{}

	if format == "table" {
		timeField := grafanadata.NewField("Time", nil, []time.Time{})
		valueFields := []*grafanadata.Field{}
		lnameDuplicateCounter := map[string]int{}
		for si := range data {
			siPlus1 := si + 1
			siPlus1Str := strconv.Itoa(siPlus1)
			dummy := name + " [" + siPlus1Str + "]"
			lname := dummy
			tags := []string{}
			if len(meta) > si {
				lname = meta[si].Label
				tags = meta[si].Tags
			}
			lname = td.taglessName(lname)
			metricLabel := ""
			if len(metricLabels) > si {
				metricLabel = metricLabels[si]
				lname = metricLabel
			}
			if len(check_tags) > si {
				if len(tags) == 0 {
					tags = check_tags[si]
				} else {
					tags = append(tags, check_tags[si]...)
				}
			}
			if len(tags) > 0 {
				for _, tag := range tags {
					tagSep := strings.Split(tag, ":")
					tagCat, newTagSep := td.Shift(tagSep)
					tagSep = newTagSep
					tagVal := strings.Join(tagSep, ":")
					if !strings.HasPrefix(tagCat, "__") {
						tagCat = td.decodeTag(tagCat)
						tagVal = td.decodeTag(tagVal)
					}
				}
			}
			valueField := grafanadata.NewField(lname, nil, []float64{})
			_, exists := lnameDuplicateCounter[lname]
			if exists {
				lnameDuplicateCounter[lname] += 1
				lname = lname + " (" + strconv.Itoa(lnameDuplicateCounter[lname]) + ")"
			} else {
				lnameDuplicateCounter[lname] = 0
			}
			valueField = valueField.SetConfig(&grafanadata.FieldConfig{DisplayName: lname})
			for dataIndex := range data[si] {
				if si == 0 {
					ts := (start + dataIndex * period) * 1000
					timeField.Append(time.UnixMilli(int64(ts)))
				}
				valueField.Append(data[si][dataIndex])
			}
			valueFields = append(valueFields, valueField)
		}
		allFields := append([]*grafanadata.Field{timeField}, valueFields...)
		frame := grafanadata.NewFrame(name, allFields...)
		dataFrames = append(dataFrames, frame)
		return DF4Response{
			DataFrames: dataFrames,
			query: *query,
		}, nil
	}

	// lookaside := map[string]LookasideObject{}
	for si := range data {
		siPlus1 := si + 1
		siPlus1Str := strconv.Itoa(siPlus1)
		dummy := name + " [" + siPlus1Str + "]"
		tname := dummy
		tags := []string{}
		if len(meta) > si {
			tname = meta[si].Label
			tags = meta[si].Tags
		}
		var explicitTags bool
		re := regexp.MustCompile(`\|ST\[[^\]]*\]`)
		explicitTags = re.MatchString(tname)
		lname := td.taglessName(tname)
		metricLabel := ""
		if len(metricLabels) > si {
			metricLabel = metricLabels[si]
			lname = metricLabel
		}
		labels := map[string]string{}

		if len(check_tags) > si {
			if len(tags) == 0 {
				tags = check_tags[si]
			} else {
				tags = append(tags, check_tags[si]...)
			}
		}

		decoded_tags := []string{}
		if len(tags) > 0 {
			for _, tag := range tags {
				tagSep := strings.Split(tag, ":")
				tagCat, newTagSep := td.Shift(tagSep)
				tagSep = newTagSep
				tagVal := strings.Join(tagSep, ":")
				if !strings.HasPrefix(tagCat, "__") {
					tagCat = td.decodeTag(tagCat)
					tagVal = td.decodeTag(tagVal)
					labels[tagCat] = tagVal
					decoded_tags = append(decoded_tags, tagCat + ":" + tagVal)
				}
			}
		}
		lname = td.decodeTagsInLabel(lname)
		dname := lname
		if metricLabel == "" && len(decoded_tags) > 0 && explicitTags {
			dname += " { " + strings.Join(decoded_tags, ", ") + " }"
		}
		timeField := grafanadata.NewField("Time", nil, []time.Time{})
		timeField = timeField.SetConfig(&grafanadata.FieldConfig{Interval: float64(period * 1000)})

		grafanaLabels := grafanadata.Labels(labels)
		numberField := grafanadata.NewField("Value", grafanaLabels, []float64{})
		numberField = numberField.SetConfig(&grafanadata.FieldConfig{DisplayName: dname})
		frame := grafanadata.NewFrame(lname, timeField, numberField)

		for dataIndex := range data[si] {
			ts := (start + dataIndex * period) * 1000
			if ts < int(query.start) * 1000 {
				continue
			}
			if data[si][dataIndex] == nil {
				continue
			}
			frame.AppendRow(time.UnixMilli(int64(ts)), *data[si][dataIndex])
			// BSR TBD: Implement heatmap logic. Needs to imagine data[si][dataIndex] as a struct, not an int
		}
		if timeField.Len() > 0 {
			dataFrames = append(dataFrames, frame)
		}
	}
	return DF4Response{
		DataFrames: dataFrames,
		query: *query,
	}, nil
}

func (td *CirconusDatasource) decodeTagsInLabel(label string) string {
	re := regexp.MustCompile(`b"[^"]+"`)
	matches := re.FindAllString(label, -1)
	for _, match := range matches {
		decoded := td.decodeTag(match)
		label = strings.Replace(label, match, decoded, 1)
	}
	return label
}

func (td *CirconusDatasource) Shift(s []string) (string, []string) {
	var zero string
	if len(s) == 0 {
		return zero, s
	}
	return s[0], s[1:]
}

type ResponseData struct {
	Head ResponseDataHead `json:"head"`
	Data [][]*float64 `json:"data"`
	Version string `json:"version"`
	Meta []ResponseDataMeta `json:"meta"`
}

type ResponseDataMeta struct {
	Kind string `json:"kind"`
	Tags []string `json:"tags"`
	Label string `json:"label"`
}

type ResponseDataHead struct {
	Period int `json:"period"`
	Count int `json:"count"`
	Start int `json:"start"`
	Query string `json:"query"`
	Warning []string `json:"warning"`
	Error []string `json:"error"`
}

func (td *CirconusDatasource) buildBody(bodyData *RequestOptionsData) (io.Reader, error) {
	bodyBytes, err := json.Marshal(bodyData)
	if err != nil {
		log.DefaultLogger.Error("error marshalling request body", "error", err, "bodyData", bodyData)
		return nil, err
	}

	return bytes.NewReader(bodyBytes), nil
}

type Stream struct {
	Transform string `json:"transform"`
	Name string `json:"name"`
	UUID string `json:"uuid"`
	Kind string `json:"kind"`
}

func (td *CirconusDatasource) isStatsdCounter(leafName string) bool {
	rawTags := td.taglessNameAndTags(leafName)[1]
	tagSet := td.splitTags(rawTags, true)

	return td.includes(tagSet["statsd_type"], "count")
}

func (td *CirconusDatasource) includes(list []string, val string) bool {
	for _, v := range list {
		if v == val {
			return true
		}
	}
	return false
}

type TagSet map[string][]string

func (td *CirconusDatasource) splitTags(rawTags string, decode bool) TagSet {
	outTags := make(TagSet)
	tagsSplit := strings.Split(rawTags, ",")
	for _, tag := range tagsSplit {
		tagSep := strings.Split(tag, ":")
		tagCat := tagSep[0]
		tagSep = tagSep[1:]
		tagVal := strings.Join(tagSep, ":")
		if decode {
			tagCat = td.decodeTag(tagCat)
			tagVal = td.decodeTag(tagVal)
		}
		tagVals := outTags[tagCat]
		if tagVals == nil {
			tagVals = []string{}
			outTags[tagCat] = tagVals
		}
		tagVals = append(tagVals, tagVal)
	}
	return outTags
}

func (td *CirconusDatasource) decodeTag(tag string) string {
	// The JS regex ^b(["!]{1}).+\1$ uses \1 (a backreference to the opening " or !).
	// Go’s regexp (RE2) does not support backreferences, so we can’t directly port that regex.
	if len(tag) >= 4 && tag[0] == 'b' {
		del := tag[1]
		if (del == '"' || del == '!') && tag[len(tag)-1] == del {
			inner := tag[2 : len(tag)-1]

			if decoded, err := base64.StdEncoding.DecodeString(inner); err == nil {
				return string(decoded)
			}
		}
	}

	return tag
}

func (td *CirconusDatasource) taglessName(name string) string {
	return td.taglessNameAndTags(name)[0]
}

func (td *CirconusDatasource) taglessNameAndTags(name string) ([]string) {
	tags := ""
	tagStart := strings.Index(name, "ST[")
	if tagStart != -1 {
		tags = name[tagStart+3 : len(name)-1]
		name = name[:tagStart-1]
	}
	return []string{name, tags}
}

func (td *CirconusDatasource) histogramTransforms(transform string) (string) {
	switch transform {
	case "count":
		return "count"
	case "average":
		return "average"
	case "stddev":
		return "stddev"
	case "derive":
		return "rate"
	case "derive_stddev":
		return "derive_stddev"
	case "counter":
		return "rate"
	case "counter_stddev":
		return "counter_stddev"
	case "histogram":
		return "none"
	default:
		return "none"
	}
}

func (td *CirconusDatasource) getRollupSpan(preppedItems *DataRequestItems, start int, end int, isCaql bool, leafData LeafData) float64 {
	rollupType := leafData.rollupType
	metricRollup := leafData.metricRollup
	if rollupType != "automatic" && metricRollup == "" {
		rollupType = "automatic"
	}
	if rollupType == "exact" {
		exactMs, err := td.parseDurationMS(metricRollup)
		if err != nil {
			log.DefaultLogger.Error("invalid exact rollup duration", "error", err, "duration", metricRollup)
			return 0
		}
		MAX_EXACT_DATAPOINTS_THRESHOLD := 1.5
		exactDatapoints := ((end - start) * 1000) / exactMs
		if float64(exactDatapoints) > float64(preppedItems.maxDataPoints) * MAX_EXACT_DATAPOINTS_THRESHOLD {
			log.DefaultLogger.Error("exact rollup results in too many datapoints")
			return 0
		}
		ROLLUP_ALIGN_MS := []int{1000, 60000, 3600000, 86400000}
		for _, alignMs := range ROLLUP_ALIGN_MS {
			if exactMs < alignMs {
				if alignMs % exactMs != 0 {
					log.DefaultLogger.Error("unaligned rollup period requested")
					return 0
				}
			}
		}
		ROLLUP_ALIGN_MS_1DAY := 86400000
		isGreaterThanOneDay := exactMs > ROLLUP_ALIGN_MS_1DAY
		notAlignedToDays := exactMs % ROLLUP_ALIGN_MS_1DAY != 0
		if isGreaterThanOneDay && notAlignedToDays {
			log.DefaultLogger.Error("unaligned rollup period requested")
			return 0
		}

		return td.forceRollupAlignment(float64(exactMs)) / 1000
	} else {
		MIN_DURATION_MS_FETCH := 1
		MIN_DURATION_MS_CAQL := 60000
		MAX_DATAPOINTS_THRESHOLD := 1.5
		minimumMs := MIN_DURATION_MS_FETCH
		if isCaql {
			minimumMs = MIN_DURATION_MS_CAQL
		}
		if rollupType == "minimum" {
			minimumMsTemp, err := td.parseDurationMS(metricRollup)
			if err != nil {
				log.DefaultLogger.Error("invalid minimum rollup duration", "error", err, "duration", metricRollup)
				return 0
			}
			minimumMs = minimumMsTemp
		}
		intervalMs := td.max([]float64{float64(preppedItems.intervalMs), float64(minimumMs)})
		interval := td.nudgeInterval(td.forceRollupAlignment(intervalMs) / 1000, -1)

		limit := float64(preppedItems.maxDataPoints) * MAX_DATAPOINTS_THRESHOLD
		for (float64((end - start)) / interval) > limit {
			interval = td.nudgeInterval(interval + 0.001, 1)
		}

		return interval
	}
}

func (td *CirconusDatasource) nudgeInterval(interval float64, direction int) float64 {
	_s := []float64{1, 0.5, 0.25, 0.2, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.002, 0.001}
	_m := []float64{60, 30, 20, 15, 10, 5, 3, 2, 1}
	_h := []float64{3600, 1800, 1200, 900, 600, 300, 180, 120, 60}
	_d := []float64{86400, 43200, 28800, 21600, 14400, 10800, 7200, 3600}
	_matchset := [][]float64{_s, _m, _h, _d}

	if direction != -1 {
		direction = 1
	}

	if interval < 0.001 {
		return 0.001
	}
	for _, set := range _matchset {
		if interval < set[0] {
			for idx, _ := range set {
				if interval > set[idx] {
					if direction == -1 {
						return set[idx]
					} else {
						return set[idx-1]
					}
				}
				if interval == set[idx] {
					return set[idx]
				}
			}
		}
	}
	if int(interval) % 86400 == 0 {
		return interval
	}
	if direction == 1 {
		return (1 + (interval / 86400)) * 86400
	}
	return (interval / 86400) * 86400
}

func (td *CirconusDatasource) min(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	min := values[0]
	for _, v := range values[1:] {
		if v < min {
			min = v
		}
	}
	return min
}

func (td *CirconusDatasource) max(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	max := values[0]
	for _, v := range values[1:] {
		if v > max {
			max = v
		}
	}
	return max
}

func (td *CirconusDatasource) forceRollupAlignment(rollupMs float64) float64 {
	if rollupMs < 60000 {
		base := float64(10000)
		rounded := ((rollupMs + base - 1) / base) * base
		rollupMs = td.max([]float64{rounded, base})
	}
	return float64(rollupMs)
}

func (td *CirconusDatasource) parseDurationMS(durationStr string) (int, error) {
	durationRegexp := regexp.MustCompile(`^([0-9]+)(ms|s|m|h|d)?$`)
	durationUnitsDefault := "s"
	durationUnits := map[string]int{
		"ms": 1,
		"s":  1000,
		"m":  1000 * 60,
		"h":  1000 * 60 * 60,
		"d":  1000 * 60 * 60 * 24,
	}

	lower := strings.ToLower(durationStr)
	matches := durationRegexp.FindStringSubmatch(lower)
	if matches == nil {
		return 0, fmt.Errorf("invalid time duration: %s", durationStr)
	}
	valueStr := matches[1]
	unit := matches[2]
	if unit == "" {
		unit = durationUnitsDefault
	}
	multiplier, ok := durationUnits[unit]
	if !ok {
		return 0, fmt.Errorf("invalid time unit %q in duration %s", unit, durationStr)
	}
	value, err := strconv.ParseInt(valueStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid numeric value %q in duration %s: %w", valueStr, durationStr, err)
	}

	return int(value) * multiplier, nil
}

// func (td *CirconusDatasource) basicQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
// 	basic, err := jsonp.GetString(q.JSON, "query")
// 	if err != nil {
// 		log.DefaultLogger.Error("key query missing from basic query",
// 			"error", err, "query", string(q.JSON))
// 		return nil, fmt.Errorf("key query missing from basic query: %w", err)
// 	}

// 	iq := IrondbQuery{Basic: basic}
// 	err = iq.ParseBasic()
// 	if err != nil {
// 		log.DefaultLogger.Error("unable to parse basic query", "error", err)
// 		return nil, fmt.Errorf("unable to parse basic query: %w", err)
// 	}
// 	query, err := iq.ToCaql()
// 	if err != nil {
// 		log.DefaultLogger.Error("unable to convert basic query to CAQL", "error", err)
// 		return nil, fmt.Errorf("unable to convert basic query to CAQL: %w", err)
// 	}

// 	return td.caqlAPI(ctx, q, query)
// }

// func (td *CirconusDatasource) caqlQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
// 	query, err := jsonp.GetString(q.JSON, "query")
// 	if err != nil {
// 		log.DefaultLogger.Error("key query missing from CAQL query",
// 			"error", err)
// 		return nil, fmt.Errorf("key query missing from CAQL query: %w", err)
// 	}

// 	log.DefaultLogger.Info("caqlQuery", "caql", query)

// 	return td.caqlAPI(ctx, q, query)
// }

// func (td *CirconusDatasource) graphiteQuery(ctx context.Context, q backend.DataQuery) (*backend.DataResponse, error) {
// 	query, err := jsonp.GetString(q.JSON, "query")
// 	if err != nil {
// 		log.DefaultLogger.Error("key query missing from graphite query",
// 			"error", err, "query", string(q.JSON))
// 		return nil, fmt.Errorf("key query missing from graphite query: %w", err)
// 	}

// 	tagFilter, err := jsonp.GetString(q.JSON, "tagFilter")
// 	if err != nil && err != jsonp.KeyPathNotFoundError {
// 		log.DefaultLogger.Error("unable to get tagFilter for graphite query",
// 			"error", err, "query", string(q.JSON))
// 		return nil, fmt.Errorf("unable to get tagFilter for graphite query: %w", err)
// 	}

// 	// Convert the graphite query to an equivalent CAQL query.
// 	caqlQ := "graphite:find('" + strings.ReplaceAll(query, " ", "") + "'"

// 	if tagFilter != "" {
// 		caqlQ += ",'" + tagFilter + "'"
// 	}

// 	caqlQ += ")"

// 	log.DefaultLogger.Info("graphiteQuery", "graphite", query, "caql", caqlQ)

// 	return td.caqlAPI(ctx, q, caqlQ)
// }

// type DF4Response struct {
// 	Version string          `json:"version"`
// 	Data    [][]interface{} `json:"data"`
// 	Meta    []DF4Meta       `json:"meta"`
// 	Head    DF4Head         `json:"head"`
// }

// type DF4Head struct {
// 	Count  uint64 `json:"count"`
// 	Period uint64 `json:"period"`
// 	Start  uint64 `json:"start"`
// }

// type DF4Meta struct {
// 	Kind  string   `json:"kind"`
// 	Label string   `json:"label"`
// 	Tags  []string `json:"tags"`
// }

// func (td *CirconusDatasource) caqlAPI(_ context.Context, q backend.DataQuery, query string) (*backend.DataResponse, error) {
// 	// If needed include min_period setting in the CAQL query.
// 	if !strings.HasPrefix(query, "#min_period=") {
// 		minPeriod, err := jsonp.GetString(q.JSON, "min_period")
// 		if err != nil && err != jsonp.KeyPathNotFoundError {
// 			log.DefaultLogger.Error("unable to parse CAQL query min_period", "error", err)
// 			return nil, fmt.Errorf("unable to parse CAQL query min_period: %w", err)
// 		}

// 		if minPeriod != "" {
// 			query = "#min_period=" + minPeriod + " " + query
// 		}
// 	}

// 	// https://docs.circonus.com/circonus/api/#/CAQL
// 	qp := url.Values{}
// 	qp.Set("query", query)
// 	if td.truncateNow {
// 		// shift entire query window back by one minute to reduce impact of partial "now" sample(s)
// 		qp.Set("end", fmt.Sprintf("%d", q.TimeRange.To.Add(-1*time.Minute).Unix()))
// 		qp.Set("start", fmt.Sprintf("%d", q.TimeRange.From.Add(-1*time.Minute).Unix()))
// 	} else {
// 		qp.Set("end", fmt.Sprintf("%d", q.TimeRange.To.Unix()))
// 		qp.Set("start", fmt.Sprintf("%d", q.TimeRange.From.Unix()))
// 	}
// 	qp.Set("period", "60") // because q.Interval is 0 fmt.Sprintf("%d", int(q.Interval.Seconds())))
// 	qp.Set("format", "DF4")
// 	path := url.URL{
// 		Path:     "/v2/caql",
// 		RawQuery: qp.Encode(),
// 	}

// 	// log.DefaultLogger.Info("caql api", "path", path.String())

// 	respdata, err := td.circ.Get(path.String())
// 	if err != nil {
// 		log.DefaultLogger.Error("error returned from circonus api",
// 			"error", err, "request", path.String())
// 		return nil, fmt.Errorf("error returned from circonus API: %w", err)
// 	}

// 	var resp DF4Response
// 	if err := json.Unmarshal(respdata, &resp); err != nil {
// 		log.DefaultLogger.Error("unable to unmarshal response data",
// 			"error", err, "response", string(respdata))
// 		return nil, fmt.Errorf("unable to unmarshal response data: %w", err)
// 	}

// 	if resp.Version != "DF4" {
// 		log.DefaultLogger.Error("invalid response version", "version", resp.Version)
// 		return nil, fmt.Errorf("invalid response version (%s)", resp.Version)
// 	}

// 	// updated to reflect what graphite datasource does
// 	// https://github.com/grafana/grafana/blob/main/pkg/tsdb/graphite/graphite.go#L229-L256

// 	frames := data.Frames{}
// 	for id, meta := range resp.Meta {
// 		if meta.Kind != "numeric" {
// 			continue
// 		}
// 		times := make([]time.Time, 0, len(resp.Data[id]))
// 		values := make([]float64, 0, len(resp.Data[id]))
// 		ts := resp.Head.Start
// 		for _, sample := range resp.Data[id] {
// 			times = append(times, time.Unix(int(ts), 0))
// 			ts += resp.Head.Period

// 			if val, ok := sample.(float64); ok {
// 				values = append(values, val)
// 			} else {
// 				values = append(values, 0)
// 			}
// 		}
// 		tags := make(map[string]string)
// 		for _, tag := range meta.Tags {
// 			if strings.HasPrefix(tag, "__") {
// 				continue // skip internal tags
// 			}
// 			parts := strings.SplitN(tag, ":", 2)
// 			tc := ""
// 			tv := ""
// 			if len(parts) > 0 {
// 				tc = parts[0]
// 				if len(parts) > 1 {
// 					tv = parts[1]
// 				}
// 				tags[tc] = tv
// 			}
// 		}

// 		// log.DefaultLogger.Info("add frame", "name", meta.Label, "time", times, "value", values, "tags", tags)

// 		frames = append(
// 			frames,
// 			data.NewFrame(meta.Label, data.NewField("time", nil, times),
// 				data.NewField("value", tags, values).SetConfig(&data.FieldConfig{DisplayNameFromDS: meta.Label})))
// 	}

// 	return &backend.DataResponse{Frames: frames}, nil
// }

// // CheckHealth handles health checks sent from Grafana to the plugin.
// // The main use case for these health checks is the test button on the
// // datasource configuration page which allows users to verify that
// // a datasource is working as expected.
// func (td *CirconusDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
// 	var status = backend.HealthStatusOk
// 	var message = "Data source is working"

// 	if rand.Int()%2 == 0 { //nolint:gosec
// 		status = backend.HealthStatusError
// 		message = "randomized error"
// 	}

// 	return &backend.CheckHealthResult{
// 		Status:  status,
// 		Message: message,
// 	}, nil
// }
