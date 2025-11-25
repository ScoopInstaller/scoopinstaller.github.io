import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Col, Dropdown, Form, Row } from 'react-bootstrap';
import type { IconBaseProps } from 'react-icons';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { GoSettings } from 'react-icons/go';
import SearchResultsJson from '../serialization/SearchResultsJson';
import BucketTypeIcon from './BucketTypeIcon';
import SearchStatus, { SearchStatusType } from './SearchStatus';

export enum SortDirection {
  Ascending,
  Descending,
}

type SortMode = {
  DisplayName: string;
  DefaultSortDirection: SortDirection;
  OrderBy: { [sortDirection in SortDirection]: string[] };
};

type SearchProcessorProps = {
  page: number;
  query: string;
  sortIndex: number;
  sortDirection: SortDirection;
  officialOnly: boolean;
  onOfficialOnlyChange: (officialOnly: boolean) => void;
  distinctManifestsOnly: boolean;
  onDistinctManifestsOnlyChange: (distinctManifestsOnly: boolean) => void;
  installBucketName: boolean;
  onInstallBucketName: (installBucketName: boolean) => void;
  resultsPerPage: number;
  onResultsChange: (value?: SearchResultsJson) => void;
  onSortChange: (sortIndex: number, sortDirection: SortDirection) => void;
};

export const sortModes: SortMode[] = [
  {
    DisplayName: 'Best match',
    DefaultSortDirection: SortDirection.Descending,
    OrderBy: {
      [SortDirection.Ascending]: ['search.score() asc', 'Metadata/OfficialRepositoryNumber asc', 'NameSortable desc'],
      [SortDirection.Descending]: ['search.score() desc', 'Metadata/OfficialRepositoryNumber desc', 'NameSortable asc'],
    },
  },
  {
    DisplayName: 'Name',
    DefaultSortDirection: SortDirection.Ascending,
    OrderBy: {
      [SortDirection.Ascending]: [
        'NameSortable asc',
        'Metadata/OfficialRepositoryNumber desc',
        'Metadata/RepositoryStars desc',
        'Metadata/Committed desc',
      ],
      [SortDirection.Descending]: [
        'NameSortable desc',
        'Metadata/OfficialRepositoryNumber asc',
        'Metadata/RepositoryStars asc',
        'Metadata/Committed asc',
      ],
    },
  },
  {
    DisplayName: 'Newest',
    DefaultSortDirection: SortDirection.Descending,
    OrderBy: {
      [SortDirection.Ascending]: [
        'Metadata/Committed asc',
        'Metadata/OfficialRepositoryNumber asc',
        'Metadata/RepositoryStars asc',
      ],
      [SortDirection.Descending]: [
        'Metadata/Committed desc',
        'Metadata/OfficialRepositoryNumber desc',
        'Metadata/RepositoryStars desc',
      ],
    },
  },
];

const { VITE_APP_AZURESEARCH_URL, VITE_APP_AZURESEARCH_KEY } = import.meta.env;

const SearchProcessor = (props: SearchProcessorProps): JSX.Element => {
  const [resultsCount, setResultsCount] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController>(new AbortController());
  const {
    query,
    page,
    resultsPerPage,
    sortIndex,
    sortDirection,
    officialOnly,
    onOfficialOnlyChange,
    distinctManifestsOnly,
    onDistinctManifestsOnlyChange,
    installBucketName,
    onInstallBucketName,
    onResultsChange,
    onSortChange,
  } = props;

  const handleSortChange = useCallback(
    (idx: number, direction: SortDirection): void => {
      onSortChange(idx, direction);
    },
    [onSortChange]
  );

  const toggleOfficialOnly = useCallback(
    (e: React.MouseEvent<HTMLElement>): void => {
      e.currentTarget.blur();
      onOfficialOnlyChange(!officialOnly);
    },
    [officialOnly, onOfficialOnlyChange]
  );

  const toggleDistinctManifestsOnly = useCallback(
    (e: React.MouseEvent<HTMLElement>): void => {
      e.currentTarget.blur();
      onDistinctManifestsOnlyChange(!distinctManifestsOnly);
    },
    [distinctManifestsOnly, onDistinctManifestsOnlyChange]
  );

  const toggleInstallBucketName = useCallback(
    (e: React.MouseEvent<HTMLElement>): void => {
      e.currentTarget.blur();
      onInstallBucketName(!installBucketName);
    },
    [installBucketName, onInstallBucketName]
  );

  const toggleSort = useCallback(
    (e: React.MouseEvent<HTMLElement>, newSortIndex: number): void => {
      e.currentTarget.blur();
      handleSortChange(
        newSortIndex,
        newSortIndex === sortIndex
          ? (((sortDirection + 1) % 2) as SortDirection)
          : sortModes[newSortIndex].DefaultSortDirection
      );
    },
    [sortIndex, sortDirection, handleSortChange]
  );

  useEffect(() => {
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const fetchDataAsync = (abortSignal: AbortSignal): void => {
      setSearching(true);

      if (!VITE_APP_AZURESEARCH_URL) {
        throw new Error('VITE_APP_AZURESEARCH_URL is not defined');
      }

      if (!VITE_APP_AZURESEARCH_KEY) {
        throw new Error('VITE_APP_AZURESEARCH_KEY is not defined');
      }

      const filters: string[] = [];
      if (officialOnly) {
        filters.push('Metadata/OfficialRepositoryNumber eq 1');
      }

      if (distinctManifestsOnly) {
        filters.push('Metadata/DuplicateOf eq null');
      }

      const url = `${VITE_APP_AZURESEARCH_URL}/search?api-version=2020-06-30`;
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          count: true,
          search: query.trim(),
          searchMode: 'all',
          filter: filters.join(' and '),
          orderby: sortModes[sortIndex].OrderBy[sortDirection].join(', '),
          skip: (page - 1) * resultsPerPage,
          top: resultsPerPage,
          select: [
            'Id',
            'Name',
            'NamePartial',
            'NameSuffix',
            'Description',
            'Notes',
            'Homepage',
            'License',
            'Version',
            'Metadata/Repository',
            'Metadata/FilePath',
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
          ].join(','),
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
        }),
        headers: {
          'api-key': VITE_APP_AZURESEARCH_KEY,
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
  }, [query, page, sortIndex, sortDirection, officialOnly, distinctManifestsOnly, resultsPerPage, onResultsChange]);

  const SortIcon = (sortIconProps: { currentSortIndex: number } & IconBaseProps): JSX.Element => {
    const { currentSortIndex, ...sortIconRest } = sortIconProps;

    if (sortIndex === currentSortIndex) {
      if (sortDirection === sortModes[currentSortIndex].DefaultSortDirection) {
        return <FaSortAmountDown {...sortIconRest} />;
      } else {
        return <FaSortAmountUp {...sortIconRest} />;
      }
    } else {
      return <FaSortAmountDown {...sortIconRest} visibility="hidden" />;
    }
  };

  const formatSortingAndFiltering = () => {
    const currentSort = sortModes[sortIndex].DisplayName;
    const currentFilter = officialOnly ? 'Official buckets only' : 'All buckets';
    return `${currentSort}, ${currentFilter}`;
  };

  return (
    <Form>
      <Row>
        <Col xs={8} className="my-auto">
          <SearchStatus
            query={query}
            resultsCount={resultsCount}
            searching={searching}
            type={SearchStatusType.Applications}
            officialOnly={officialOnly}
          />
        </Col>
        <Col xs={4} className="text-end">
          <Dropdown autoClose="outside" align="end" drop="end" className="sorting-filtering-button">
            <Dropdown.Toggle size="sm" variant="secondary">
              <GoSettings className="me-2" />
              <span className="d-none d-sm-inline">{formatSortingAndFiltering()}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="sorting-filtering-menu">
              <Dropdown.Header>Sorting</Dropdown.Header>
              {sortModes.map((item, idx) => (
                <Dropdown.Item key={item.DisplayName} as={Button} onClick={(e) => toggleSort(e, idx)}>
                  <SortIcon currentSortIndex={idx} className="me-2" />
                  {item.DisplayName}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Header>Filtering</Dropdown.Header>
              <Dropdown.Item as={Button} onClick={(e) => toggleOfficialOnly(e)}>
                <Form.Switch className="form-switch-sm">
                  <Form.Switch.Input checked={officialOnly} />
                  <Form.Switch.Label>
                    Official buckets only <BucketTypeIcon className="ms-1" official showTooltip={false} />
                  </Form.Switch.Label>
                </Form.Switch>
              </Dropdown.Item>
              <Dropdown.Item as={Button} onClick={(e) => toggleDistinctManifestsOnly(e)}>
                <Form.Switch className="form-switch-sm">
                  <Form.Switch.Input checked={distinctManifestsOnly} />
                  <Form.Switch.Label>Distinct manifests only</Form.Switch.Label>
                </Form.Switch>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Header>Option</Dropdown.Header>
              <Dropdown.Item as={Button} onClick={(e) => toggleInstallBucketName(e)}>
                <Form.Switch className="form-switch-sm">
                  <Form.Switch.Input checked={installBucketName} />
                  <Form.Switch.Label>Show bucket name</Form.Switch.Label>
                </Form.Switch>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
    </Form>
  );
};

export default React.memo(SearchProcessor);
