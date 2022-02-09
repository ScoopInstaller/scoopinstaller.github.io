import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Col, Row, Form, InputGroup } from 'react-bootstrap';

import SearchResultsJson from '../serialization/SearchResultsJson';
import BucketTypeIcon from './BucketTypeIcon';
import SearchStatus, { SearchStatusType } from './SearchStatus';

type SortMode = {
  DisplayName: string;
  OrderBy: string[];
};

type SearchProcessorProps = {
  page: number;
  query: string;
  sortIndex: number;
  searchOfficialOnly: boolean;
  resultsPerPage: number;
  onResultsChange: (value?: SearchResultsJson) => void;
  onSortIndexChange: (sortIndex: number) => void;
  onSearchOfficialOnlyChange: (searchOfficialOnly: boolean) => void;
};

const sortModes: SortMode[] = [
  {
    DisplayName: 'Best match',
    OrderBy: ['search.score() desc', 'Metadata/OfficialRepositoryNumber desc', 'NameSortable asc'],
  },
  {
    DisplayName: 'Name',
    OrderBy: [
      'NameSortable asc',
      'Metadata/OfficialRepositoryNumber desc',
      'Metadata/RepositoryStars desc',
      'Metadata/Committed desc',
    ],
  },
  {
    DisplayName: 'Newest',
    OrderBy: ['Metadata/Committed desc', 'Metadata/OfficialRepositoryNumber desc', 'Metadata/RepositoryStars desc'],
  },
];

const { REACT_APP_AZURESEARCH_URL, REACT_APP_AZURESEARCH_KEY } = process.env;

const SearchProcessor = (props: SearchProcessorProps): JSX.Element => {
  const [resultsCount, setResultsCount] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController>(new AbortController());
  const {
    query,
    page,
    resultsPerPage,
    sortIndex,
    searchOfficialOnly,
    onResultsChange,
    onSortIndexChange,
    onSearchOfficialOnlyChange,
  } = props;

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      onSortIndexChange(e.target.selectedIndex);
    },
    [onSortIndexChange]
  );

  const handleSearchOfficialOnlyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      onSearchOfficialOnlyChange(e.target.checked);
    },
    [onSearchOfficialOnlyChange]
  );

  useEffect(() => {
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const fetchDataAsync = (abortSignal: AbortSignal): void => {
      setSearching(true);

      if (!REACT_APP_AZURESEARCH_URL) {
        throw new Error('REACT_APP_AZURESEARCH_URL is not defined');
      }

      if (!REACT_APP_AZURESEARCH_KEY) {
        throw new Error('REACT_APP_AZURESEARCH_KEY is not defined');
      }

      const url = `${REACT_APP_AZURESEARCH_URL}/search?api-version=2020-06-30`;
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          count: true,
          search: query.trim(),
          searchMode: 'all',
          filter: searchOfficialOnly ? 'Metadata/OfficialRepositoryNumber eq 1' : '',
          orderby: sortModes[sortIndex].OrderBy.join(', '),
          skip: (page - 1) * resultsPerPage,
          top: resultsPerPage,
          select: [
            'Id',
            'Name',
            'NamePartial',
            'NameSuffix',
            'Description',
            'Homepage',
            'License',
            'Version',
            'Metadata/Repository',
            'Metadata/FilePath',
            'Metadata/AuthorName',
            'Metadata/OfficialRepository',
            'Metadata/RepositoryStars',
            'Metadata/Committed',
            'Metadata/Sha',
          ].join(','),
          highlight: [
            'Name',
            'NamePartial',
            'NameSuffix',
            'Description',
            'Version',
            'License',
            'Metadata/Repository',
            'Metadata/AuthorName',
          ].join(','),
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
        }),
        headers: {
          'api-key': REACT_APP_AZURESEARCH_KEY,
          'Content-Type': 'application/json',
        },
        signal: abortSignal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
          }

          return response.json();
        })
        .then((data) => {
          const results = SearchResultsJson.Create(data);

          setSearching(false);
          setResultsCount(results.count);
          onResultsChange(results);
        })
        .catch((error: Error) => {
          if (error.name !== 'AbortError') {
            setSearching(false);
            setResultsCount(0);
            onResultsChange(undefined);
          }
        });
    };

    fetchDataAsync(abortControllerRef.current.signal);

    return () => abortControllerRef.current.abort();
  }, [query, page, sortIndex, searchOfficialOnly, resultsPerPage, onResultsChange]);

  return (
    <Form>
      <Row>
        <Col className="my-auto">
          <SearchStatus
            query={query}
            resultsCount={resultsCount}
            searching={searching}
            type={SearchStatusType.Applications}
          />
        </Col>
        <Col lg={3}>
          <Row>
            <Col>
              <InputGroup size="sm">
                <InputGroup.Text>Sort by</InputGroup.Text>
                <Form.Select size="sm" value={sortIndex} onChange={handleSortChange}>
                  {sortModes.map((item, idx) => (
                    <option key={item.DisplayName} value={idx}>
                      {item.DisplayName}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
          <Row className="form-select-sm float-end">
            <Col>
              <Form.Check type="switch" id="only-official-buckets">
                <Form.Check.Input checked={searchOfficialOnly} onChange={handleSearchOfficialOnlyChange} />
                <Form.Check.Label>
                  Search only known buckets
                  <BucketTypeIcon className="ms-1" official showTooltip={false} />
                </Form.Check.Label>
              </Form.Check>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default React.memo(SearchProcessor);
