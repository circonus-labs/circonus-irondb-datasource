import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { CirconusQuery, CirconusDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, CirconusQuery, CirconusDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
  // setVariableQueryEditor()
  // setAnnotationQueryCtrl
