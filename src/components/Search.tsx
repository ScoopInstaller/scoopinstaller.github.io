import React, { type JSX, useCallback, useEffect, useRef, useState } from 'react';

import { Col, Container, Modal, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { requestIdleCallback } from '../request-idle-callback';
import type ManifestJson from '../serialization/ManifestJson';
import type SearchResultsJson from '../serialization/SearchResultsJson';
import SearchBar from './SearchBar';
import SearchPagination from './SearchPagination';
import SearchProcessor, { type SortDirection, sortModes } from './SearchProcessor';
import SearchResult from './SearchResult';

const RESULTS_PER_PAGE = 20;
const SEARCH_PARAM_QUERY = 'q';
const SEARCH_PARAM_PAGE = 'p';
const SEARCH_PARAM_SORT_INDEX = 's';
const SEARCH_PARAM_SORT_DIRECTION = 'd';
const SEARCH_PARAM_FILTER_OFFICIALONLY = 'o';
const SEARCH_PARAM_FILTER_DISTINCTONLY = 'dm';
const SEARCH_PARAM_OPTION_BUCKETNAME = 'n';
const SEARCH_PARAM_SELECTED_RESULT = 'id';
const SEARCH_DEBOUNCE_TIME_IN_MS = 500;

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || SEARCH_DEBOUNCE_TIME_IN_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Search = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getQueryFromSearchParams = useCallback((): string => {
    return searchParams.get(SEARCH_PARAM_QUERY) ?? '';
  }, [searchParams]);

  const getCurrentPageFromSearchParams = useCallback((): number => {
    return parseInt(searchParams.get(SEARCH_PARAM_PAGE) || '1');
  }, [searchParams]);

  const getSearchParam = useCallback(
    <T extends number | boolean | string>(key: string, defaultValue: T): T => {
      const value = searchParams.get(key) || localStorage.getItem(key);
      if (value) {
        switch (typeof defaultValue) {
          case 'number':
            return parseInt(value) as T;
          case 'boolean':
            return (value === 'true') as T;
          case 'string':
            return value as T;
        }
      }

      return defaultValue;
    },
    [searchParams]
  );

  const getSortIndexFromSearchParams = useCallback((): number => {
    return getSearchParam(SEARCH_PARAM_SORT_INDEX, 0);
  }, [getSearchParam]);

  const getSortDirectionFromSearchParams = useCallback(
    (sortIndex: number): SortDirection => {
      return getSearchParam(SEARCH_PARAM_SORT_DIRECTION, sortModes[sortIndex].DefaultSortDirection);
    },
    [getSearchParam]
  );

  const getOfficialOnlyFromSearchParams = useCallback((): boolean => {
    return getSearchParam(SEARCH_PARAM_FILTER_OFFICIALONLY, true);
  }, [getSearchParam]);

  const getDistinctManifestsOnlyFromSearchParams = useCallback((): boolean => {
    return getSearchParam(SEARCH_PARAM_FILTER_DISTINCTONLY, true);
  }, [getSearchParam]);

  const getInstallBucketNameFromSearchParams = useCallback((): boolean => {
    return getSearchParam(SEARCH_PARAM_OPTION_BUCKETNAME, true);
  }, [getSearchParam]);

  const getSelectedResultFromSearchParams = useCallback((): string => {
    return getSearchParam<string>(SEARCH_PARAM_SELECTED_RESULT, '');
  }, [getSearchParam]);

  const updateSearchParams = useCallback(
    (key: string, value: string | undefined, updateLocalStorage: boolean): void => {
      if (value) {
        searchParams.set(key, value);
        if (updateLocalStorage) {
          localStorage.setItem(key, value);
        }
      } else {
        searchParams.delete(key);
        if (updateLocalStorage) {
          localStorage.removeItem(key);
        }
      }

      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const [searchBarQuery, setSearchBarQuery] = useState<string>(getQueryFromSearchParams);
  const [query, setQuery] = useState<string>(getQueryFromSearchParams);
  const debouncedQuery = useDebounce(query);
  const [currentPage, setCurrentPage] = useState<number>(getCurrentPageFromSearchParams);
  const [sortIndex, setSortIndex] = useState<number>(getSortIndexFromSearchParams);
  const [sortDirection, setSortDirection] = useState<SortDirection>(getSortDirectionFromSearchParams(sortIndex));
  const [officialOnly, setOfficialOnly] = useState<boolean>(getOfficialOnlyFromSearchParams);
  const [distinctManifestsOnly, setDistinctManifestsOnly] = useState<boolean>(
    getDistinctManifestsOnlyFromSearchParams()
  );
  const [installBucketName, setInstallBucketName] = useState<boolean>(getInstallBucketNameFromSearchParams());
  const [searchResults, setSearchResults] = useState<SearchResultsJson>();
  const [officialRepositories, setOfficialRepositories] = useState<{ [key: string]: string }>({});
  const [selectedResult, setSelectedResult] = useState<ManifestJson | null>();
  const [selectedResultId, setSelectedResultId] = useState<string>(getSelectedResultFromSearchParams);
  const selectedResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const queryfromSearchParams = getQueryFromSearchParams();
    setSearchBarQuery(queryfromSearchParams);
    setQuery(queryfromSearchParams);
  }, [getQueryFromSearchParams]);

  useEffect(() => {
    setCurrentPage(getCurrentPageFromSearchParams());
  }, [getCurrentPageFromSearchParams]);

  if (getSortIndexFromSearchParams() !== sortIndex) {
    setSortIndex(getSortIndexFromSearchParams());
  }
  if (getSortDirectionFromSearchParams(getSortIndexFromSearchParams()) !== sortDirection) {
    setSortIndex(getSortDirectionFromSearchParams(getSortIndexFromSearchParams()));
  }
  if (getOfficialOnlyFromSearchParams() !== officialOnly) {
    setOfficialOnly(getOfficialOnlyFromSearchParams());
  }
  if (getDistinctManifestsOnlyFromSearchParams() !== distinctManifestsOnly) {
    setDistinctManifestsOnly(getDistinctManifestsOnlyFromSearchParams());
  }
  if (getInstallBucketNameFromSearchParams() !== installBucketName) {
    setInstallBucketName(getInstallBucketNameFromSearchParams());
  }

  useEffect(() => {
    if (searchResults?.results && selectedResultId) {
      const selectedResultManifest = searchResults.results.find((x) => x.id === selectedResultId);
      if (selectedResultManifest) {
        setSelectedResult(selectedResultManifest);
        selectedResultRef.current?.scrollIntoView();
      }
    } else {
      setSelectedResult(undefined);
    }

    updateSearchParams(SEARCH_PARAM_SELECTED_RESULT, selectedResultId, false);
  }, [selectedResultId, searchResults, updateSearchParams]);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/gh/ScoopInstaller/Scoop/buckets.json')
      .then((response) => response.json())
      .then((response) => {
        const json = response as { [key: string]: string };
        const mapping: { [key: string]: string } = {};
        Object.keys(json).forEach((key) => {
          mapping[json[key]] = key;
        });
        setOfficialRepositories(mapping);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleQueryChange = useCallback(
    (newQuery: string): void => {
      updateSearchParams(SEARCH_PARAM_QUERY, newQuery, false);
      setSearchBarQuery(newQuery);
      setCurrentPage(1);
    },
    [updateSearchParams]
  );

  const handleQuerySubmit = useCallback((): void => {
    setQuery(searchBarQuery);
  }, [searchBarQuery]);

  const idleCallbackId = useRef<number>(-1);
  const handleResultsChange = useCallback((e?: SearchResultsJson): void => {
    //We should use useTransition or useDeferredValue after updating to v18 instead of this
    idleCallbackId.current = requestIdleCallback(() => setSearchResults(e));
  }, []);
  useEffect(() => () => cancelIdleCallback(idleCallbackId.current), [idleCallbackId]);

  const handlePageChange = useCallback(
    (newCurrentPage: number): void => {
      updateSearchParams(SEARCH_PARAM_PAGE, newCurrentPage.toString(), false);
      setCurrentPage(newCurrentPage);
      window.scrollTo(0, 0);
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (newSortIndex: number, newSortDirection: SortDirection): void => {
      updateSearchParams(SEARCH_PARAM_SORT_INDEX, newSortIndex.toString(), true);
      updateSearchParams(SEARCH_PARAM_SORT_DIRECTION, newSortDirection.toString(), true);
      setSortIndex(newSortIndex);
      setSortDirection(newSortDirection);
    },
    [updateSearchParams]
  );

  const handleOfficialOnlyChange = useCallback(
    (newOfficialOnly: boolean): void => {
      updateSearchParams(SEARCH_PARAM_FILTER_OFFICIALONLY, newOfficialOnly.toString(), true);
      setOfficialOnly(newOfficialOnly);
    },
    [updateSearchParams]
  );

  const handleDistinctManifestsOnlyChange = useCallback(
    (newDistinctManifestsOnly: boolean): void => {
      updateSearchParams(SEARCH_PARAM_FILTER_DISTINCTONLY, newDistinctManifestsOnly.toString(), true);
      setDistinctManifestsOnly(newDistinctManifestsOnly);
    },
    [updateSearchParams]
  );

  const handleCopyToClipboard = useCallback((newContentToCopy: string): void => {
    const handleCopyToClipboardAsync = async (data: string) => {
      await navigator.clipboard.writeText(data);
    };

    handleCopyToClipboardAsync(newContentToCopy).finally(() => {});
  }, []);

  const handleResultSelected = useCallback((result: ManifestJson): void => {
    setSelectedResultId(result.id);
  }, []);

  const handleCloseSelectedResultModal = useCallback((): void => {
    setSelectedResultId('');
  }, []);

  const handleInstallBucketName = useCallback(
    (newInstallBucketName: boolean): void => {
      updateSearchParams(SEARCH_PARAM_OPTION_BUCKETNAME, newInstallBucketName.toString(), true);
      setInstallBucketName(newInstallBucketName);
    },
    [updateSearchParams]
  );

  return (
    <>
      <Helmet>
        <title>Apps{query && ` (${query})`}</title>
      </Helmet>

      <Container className="mt-5 mb-5">
        <Row className="justify-content-center">
          <Col sm={8}>
            <SearchBar query={searchBarQuery} onQueryChange={handleQueryChange} onSubmit={handleQuerySubmit} />
          </Col>
        </Row>

        <Row className="mt-5 mb-1">
          <Col>
            <SearchProcessor
              resultsPerPage={RESULTS_PER_PAGE}
              page={currentPage}
              query={debouncedQuery}
              sortIndex={sortIndex}
              sortDirection={sortDirection}
              officialOnly={officialOnly}
              onOfficialOnlyChange={handleOfficialOnlyChange}
              distinctManifestsOnly={distinctManifestsOnly}
              onDistinctManifestsOnlyChange={handleDistinctManifestsOnlyChange}
              onResultsChange={handleResultsChange}
              onSortChange={handleSortChange}
              installBucketName={installBucketName}
              onInstallBucketName={handleInstallBucketName}
            />
          </Col>
        </Row>

        <Row className="mt-2">
          <Col>
            {searchResults?.results.map((searchResult: ManifestJson) => (
              <SearchResult
                cardRef={searchResult.id == selectedResultId ? selectedResultRef : undefined}
                key={searchResult.id}
                result={searchResult}
                officialRepositories={officialRepositories}
                installBucketName={installBucketName}
                onCopyToClipbard={handleCopyToClipboard}
                onResultSelected={handleResultSelected}
              />
            ))}
          </Col>
        </Row>

        <Row>
          <Col className="d-flex justify-content-center">
            <SearchPagination
              resultsPerPage={RESULTS_PER_PAGE}
              currentPage={currentPage}
              resultsCount={searchResults?.count ?? 0}
              onPageChange={handlePageChange}
            />
          </Col>
        </Row>
      </Container>

      <Modal
        show={selectedResult !== undefined}
        onHide={handleCloseSelectedResultModal}
        restoreFocus={false}
        size="xl"
        centered
        className="modal-selected-result"
      >
        <Modal.Body>
          {selectedResult && (
            <SearchResult
              result={selectedResult}
              officialRepositories={officialRepositories}
              installBucketName={installBucketName}
              onCopyToClipbard={handleCopyToClipboard}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default React.memo(Search);
