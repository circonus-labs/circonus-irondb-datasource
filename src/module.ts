import IrondbDatasource from './datasource';
import { IrondbQueryCtrl } from './query_ctrl';
import { IrondbConfigCtrl } from './config_ctrl';

class IrondbAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  IrondbDatasource as Datasource,
  IrondbQueryCtrl as QueryCtrl,
  IrondbConfigCtrl as ConfigCtrl,
  IrondbAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
