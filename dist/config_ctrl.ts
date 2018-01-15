///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

export class IrondbConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  constructor($scope) {
    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'standalone';
  }
}
