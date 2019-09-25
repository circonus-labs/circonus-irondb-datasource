import _ from 'lodash';

export class IrondbConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  /** @ngInject */
  constructor($scope) {
    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'standalone';
    this.current.jsonData.resultsLimit = this.current.jsonData.resultsLimit || '100';
    this.current.jsonData.useCaching = _.defaultTo(this.current.jsonData.useCaching, true);
    this.current.jsonData.activityTracking = _.defaultTo(this.current.jsonData.activityTracking, true);
  }
}
