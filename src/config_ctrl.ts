import _ from 'lodash';

export class IrondbConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  /** @ngInject */
  constructor($scope) {
    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'hosted';
    this.current.jsonData.resultsLimit = this.current.jsonData.resultsLimit || '100';
    this.current.jsonData.caqlMinPeriod = this.current.jsonData.caqlMinPeriod || '';
    this.current.jsonData.truncateNow = _.defaultTo(this.current.jsonData.truncateNow, false);
    this.current.jsonData.useCaching = _.defaultTo(this.current.jsonData.useCaching, true);
    this.current.jsonData.activityTracking = _.defaultTo(this.current.jsonData.activityTracking, true);
    //
    this.current.jsonData.allowGraphite = _.defaultTo(this.current.jsonData.allowGraphite, false);
    this.current.jsonData.queryPrefixDefault = '';
    this.current.jsonData.queryPrefix = this.current.jsonData.queryPrefix || this.current.jsonData.queryPrefixDefault;
  }

  queryPrefixKeyUp(event) {
    const self = this;
    const element = event.currentTarget;
    if (event.keyCode === 13) {
      setTimeout(() => {
        self.current.jsonData.queryPrefix = element.value;
        self.updateQueryPrefixValue(event);
      }, 0);
    }
  }

  updateQueryPrefixValue(event) {
    const element = event.currentTarget;
    let trimmed_qp = (this.current.jsonData.queryPrefix || '').trim();
    if (trimmed_qp && !/\.$/.test(trimmed_qp)) {
      element.value = this.current.jsonData.queryPrefix = trimmed_qp + '.';
    }
  }
}
