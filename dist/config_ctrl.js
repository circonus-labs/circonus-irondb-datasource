///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register([], function(exports_1) {
    var IrondbConfigCtrl;
    return {
        setters:[],
        execute: function() {
            IrondbConfigCtrl = (function () {
                function IrondbConfigCtrl($scope) {
                    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'standalone';
                }
                IrondbConfigCtrl.templateUrl = 'partials/config.html';
                return IrondbConfigCtrl;
            })();
            exports_1("IrondbConfigCtrl", IrondbConfigCtrl);
        }
    }
});
//# sourceMappingURL=config_ctrl.js.map