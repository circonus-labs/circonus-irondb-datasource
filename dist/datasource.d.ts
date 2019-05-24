/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
export default class IrondbDatasource {
    private $q;
    private backendSrv;
    private templateSrv;
    id: number;
    name: string;
    type: string;
    accountId: number;
    irondbType: string;
    resultsLimit: string;
    url: any;
    apiToken: string;
    appName: string;
    supportAnnotations: boolean;
    supportMetrics: boolean;
    basicAuth: any;
    withCredentials: any;
    /** @ngInject */
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any);
    query(options: any): any;
    annotationQuery(options: any): void;
    metricFindQuery(query: string, options: any): any;
    getAccountId(): string;
    metricTagsQuery(query: string, allowEmptyWildcard?: boolean): any;
    metricTagCatsQuery(query: string): any;
    metricTagValsQuery(query: string, cat: string): any;
    testDatasource(): any;
    _throwerr(err: any): void;
    _irondbSimpleRequest(method: any, url: any, isCaql?: boolean, isFind?: boolean, isLimited?: boolean): any;
    _irondbRequest(irondbOptions: any, isCaql?: boolean, isLimited?: boolean): Promise<{}>;
    _buildIrondbParamsAsync(options: any): {};
    _buildIrondbParams(options: any): Promise<{}>;
    _convertIrondbDataToGrafana(result: any, query: any): {
        data: any[];
    };
    _convertIrondbCaqlDataToGrafana(result: any, query: any): {
        data: any[];
    };
}
