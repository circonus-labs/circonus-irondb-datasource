import React, { useState } from 'react';
import { IronDBVariableQuery } from './types';

interface VariableQueryProps {
  query: IronDBVariableQuery | string;
  onChange: (query: IronDBVariableQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {
  const [state, setState] = useState(query);

  const transcodeState = (state: any) => {
    if (typeof state === 'string') {
      // hackery to translate older version of this datasource plugin to new version
      const tag_query_input = document.querySelector(
        '[aria-label="Variable editor Form Query TagsValuesQuery field"]'
      ) as HTMLInputElement;
      q = {
        metricFindQuery: state,
        tagCategory: tag_query_input !== null ? tag_query_input.value : '',
      };
    } else {
      q = state;
    }
    return q;
  };

  const saveQuery = () => {
    let q: IronDBVariableQuery = transcodeState(state);
    onChange(q, `${q.metricFindQuery}`);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    let q: IronDBVariableQuery = transcodeState(state);
    setState({
      ...q,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  let q: IronDBVariableQuery = transcodeState(state);
  if (typeof state === 'string') {
    setState({ ...q });
    saveQuery();
  }

  return (
    <div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Metric Find Query</span>
        <input
          name="metricFindQuery"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={q.metricFindQuery}
        />
      </div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Tag Category (to extract)</span>
        <input
          name="tagCategory"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={q.tagCategory}
        />
      </div>
    </div>
  );
};
