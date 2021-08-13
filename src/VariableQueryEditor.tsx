import React, { useState } from 'react';
import { IronDBVariableQuery } from './types';

interface VariableQueryProps {
  query: IronDBVariableQuery;
  onChange: (query: IronDBVariableQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {
  const [state, setState] = useState(query);

  const saveQuery = () => {
    onChange(state, `${state.metricFindQuery}`);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) =>
    setState({
      ...state,
      [event.currentTarget.name]: event.currentTarget.value,
    });

  return (
    <div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Metric Find Query</span>
        <input
          name="metricFindQuery"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.metricFindQuery}
        />
      </div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Tag category to extract</span>
        <input
          name="tagCategory"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.tagCategory}
        />
      </div>
    </div>
  );
};
