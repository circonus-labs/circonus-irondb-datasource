import _ from 'lodash';

export class IrondbConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  /** @ngInject */
  constructor($scope) {
    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'hosted';
    this.current.jsonData.resultsLimitDefault = '100';
    this.current.jsonData.resultsLimit =
      this.current.jsonData.resultsLimit || this.current.jsonData.resultsLimitDefault;
    this.current.jsonData.caqlMinPeriod = this.current.jsonData.caqlMinPeriod || '';
    this.current.jsonData.truncateNow = _.defaultTo(this.current.jsonData.truncateNow, false);
    this.current.jsonData.minTruncationDefault = 30;
    this.current.jsonData.minTruncation =
      this.current.jsonData.minTruncation || this.current.jsonData.minTruncationDefault;
    this.current.jsonData.useCaching = _.defaultTo(this.current.jsonData.useCaching, true);
    this.current.jsonData.activityTracking = _.defaultTo(this.current.jsonData.activityTracking, true);
    //
    this.current.jsonData.allowGraphite = _.defaultTo(this.current.jsonData.allowGraphite, false);
    this.current.jsonData.queryPrefixDefault = '';
    this.current.jsonData.queryPrefix = this.current.jsonData.queryPrefix || this.current.jsonData.queryPrefixDefault;
  }

  resultsLimitKeyUp(event) {
    const self = this;
    const element = event.currentTarget;
    if (event.keyCode === 13) {
      setTimeout(() => {
        self.current.jsonData.resultsLimit = element.value;
        self.updateResultsLimitValue(event);
      }, 0);
    }
  }

  updateResultsLimitValue(event) {
    const element = event.currentTarget;
    const trimmed_rl = (this.current.jsonData.resultsLimit || '').trim();
    const is_valid = '-1' === trimmed_rl || 'none' === trimmed_rl || !/\D/.test(trimmed_rl);
    if (trimmed_rl && is_valid) {
      element.value = this.current.jsonData.resultsLimit = trimmed_rl;
    } else {
      element.value = this.current.jsonData.resultsLimit = this.current.jsonData.resultsLimitDefault;
    }
  }

  caqlMinPeriodKeyUp(event) {
    const self = this;
    const element = event.currentTarget;
    if (event.keyCode === 13) {
      setTimeout(() => {
        self.current.jsonData.caqlMinPeriod = element.value;
        self.updateCaqlMinPeriodValue(event);
      }, 0);
    }
  }

  updateCaqlMinPeriodValue(event) {
    const element = event.currentTarget;
    const trimmed_cmp = (this.current.jsonData.caqlMinPeriod || '').trim();
    if (trimmed_cmp && !/\D/.test(trimmed_cmp)) {
      element.value = this.current.jsonData.caqlMinPeriod = trimmed_cmp;
    } else {
      element.value = this.current.jsonData.caqlMinPeriod = '';
    }
  }

  minTruncationKeyUp(event) {
    const self = this;
    const element = event.currentTarget;
    if (event.keyCode === 13) {
      setTimeout(() => {
        self.current.jsonData.minTruncation = element.value;
        self.updateMinTruncationValue(event);
      }, 0);
    }
  }

  updateMinTruncationValue(event) {
    const element = event.currentTarget;
    const trimmed_mt = (this.current.jsonData.minTruncation || '').trim();
    if (trimmed_mt && !/\D/.test(trimmed_mt)) {
      element.value = this.current.jsonData.minTruncation = trimmed_mt;
    } else {
      element.value = this.current.jsonData.minTruncation = this.current.jsonData.minTruncationDefault;
    }
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
    const trimmed_qp = (this.current.jsonData.queryPrefix || '').trim();
    if (trimmed_qp && !/\.$/.test(trimmed_qp)) {
      element.value = this.current.jsonData.queryPrefix = trimmed_qp + '.';
    }
  }
}
