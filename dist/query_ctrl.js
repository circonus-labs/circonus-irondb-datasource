///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'app/plugins/sdk', './css/query_editor.css!'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, sdk_1;
    var IrondbQueryCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (_1) {}],
        execute: function() {
            IrondbQueryCtrl = (function (_super) {
                __extends(IrondbQueryCtrl, _super);
                /** @ngInject **/
                function IrondbQueryCtrl($scope, $injector, templateSrv) {
                    _super.call(this, $scope, $injector);
                    this.templateSrv = templateSrv;
                    this.defaults = {};
                    lodash_1.default.defaultsDeep(this.target, this.defaults);
                }
                IrondbQueryCtrl.prototype.getOptions = function (query) {
                    return this.datasource.metricFindQuery(query || '');
                };
                IrondbQueryCtrl.prototype.toggleEditorMode = function () {
                    this.target.rawQuery = !this.target.rawQuery;
                };
                IrondbQueryCtrl.prototype.onChangeInternal = function () {
                    this.panelCtrl.refresh(); // Asks the panel to refresh data.
                };
                IrondbQueryCtrl.prototype.getCollapsedText = function () {
                    return this.target.query;
                };
                IrondbQueryCtrl.prototype.getMetrics = function () {
                    return [
                        'graphite.test.smee.system.cpu.percent_used',
                        'graphite.test.smee.system.load.1min',
                        'graphite.test.smee.system.load.5min',
                        'graphite.test.smee.system.load.15min',
                    ];
                };
                IrondbQueryCtrl.templateUrl = 'partials/query.editor.html';
                return IrondbQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("IrondbQueryCtrl", IrondbQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map