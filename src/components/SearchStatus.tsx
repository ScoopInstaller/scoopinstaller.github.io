import React from 'react';

import { Spinner } from 'react-bootstrap';

export enum SearchStatusType {
  Applications,
  Buckets,
}

const SearchStatusTypeMap: Record<SearchStatusType, string> = {
  [SearchStatusType.Applications]: 'applications',
  [SearchStatusType.Buckets]: 'buckets',
};

type SearchStatusProps = {
  query?: string;
  resultsCount: number;
  searching: boolean;
  type: SearchStatusType;
};

const SearchStatus = (props: SearchStatusProps): JSX.Element => {
  const { searching, resultsCount, query, type } = props;
  const typeDescription = SearchStatusTypeMap[type];

  if (searching) {
    return (
      <span>
        <span>Searching for {typeDescription}...</span> <Spinner animation="border" size="sm" variant="secondary" />
      </span>
    );
  }

  let formattedQuery = <span />;
  if (query) {
    formattedQuery = (
      <span>
        {' '}
        for &apos;<strong>{query}</strong>&apos;
      </span>
    );
  }

  if (resultsCount) {
    return (
      <span>
        Found {resultsCount} {typeDescription}
        {formattedQuery}.
      </span>
    );
  }

  return <span>No result found{formattedQuery}.</span>;
};

export default React.memo(SearchStatus);
