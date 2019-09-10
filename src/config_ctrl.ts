export class IrondbConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  constructor($scope) {
    this.current.jsonData.irondbType = this.current.jsonData.irondbType || 'standalone';
    this.current.jsonData.resultsLimit = this.current.jsonData.resultsLimit || '100';
    this.current.jsonData.useCaching = this.current.jsonData.useCaching || true;
  }
}
