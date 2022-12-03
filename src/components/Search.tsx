import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';

import ManifestJson from '../serialization/ManifestJson';
import SearchResultsJson from '../serialization/SearchResultsJson';
import CopyToClipboardHandler from './CopyToClipboardHandler';
import SearchBar from './SearchBar';
import SearchPagination from './SearchPagination';
import SearchProcessor, { SortDirection, sortModes } from './SearchProcessor';
import SearchResult from './SearchResult';

const RESULTS_PER_PAGE = 20;
const SEARCH_PARAM_QUERY = 'q';
const SEARCH_PARAM_PAGE = 'p';
const SEARCH_PARAM_SORT_INDEX = 's';
const SEARCH_PARAM_SORT_DIRECTION = 'd';
const SEARCH_PARAM_FILTER_OFFICIALONLY = 'o';
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
    <T extends number | boolean>(key: string, defaultValue: T): T => {
      const value = searchParams.get(key) || localStorage.getItem(key);
      if (value) {
        switch (typeof defaultValue) {
          case 'number':
            return parseInt(value) as T;
          case 'boolean':
            return (value === 'true') as T;
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

  const getSearchOfficialOnlyFromSearchParams = useCallback((): boolean => {
    return getSearchParam(SEARCH_PARAM_FILTER_OFFICIALONLY, true);
  }, [getSearchParam]);

  const updateSearchParams = useCallback(
    (key: string, value: string, updateLocalStorage: boolean): void => {
      searchParams.set(key, value);
      if (updateLocalStorage) {
        localStorage.setItem(key, value);
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
  const [searchOfficialOnly, setSearchOfficialOnly] = useState<boolean>(getSearchOfficialOnlyFromSearchParams);
  const [searchResults, setSearchResults] = useState<SearchResultsJson>();
  const [contentToCopy, setContentToCopy] = useState<string>();
  const [officialRepositories, setOfficialRepositories] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const queryfromSearchParams = getQueryFromSearchParams();
    setSearchBarQuery(queryfromSearchParams);
    setQuery(queryfromSearchParams);
  }, [getQueryFromSearchParams]);

  useEffect(() => {
    setCurrentPage(getCurrentPageFromSearchParams());
  }, [getCurrentPageFromSearchParams]);

  useEffect(() => {
    updateSearchParams(SEARCH_PARAM_SORT_INDEX, sortIndex.toString(), true);
    updateSearchParams(SEARCH_PARAM_SORT_DIRECTION, sortDirection.toString(), true);
    updateSearchParams(SEARCH_PARAM_FILTER_OFFICIALONLY, searchOfficialOnly.toString(), true);
  }, [updateSearchParams, sortIndex, sortDirection, searchOfficialOnly]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/ScoopInstaller/Scoop/master/buckets.json')
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

  const handleSortChange = (newSortIndex: number, newSortDirection: SortDirection): void => {
    setSortIndex(newSortIndex);
    setSortDirection(newSortDirection);
  };

  const handleSearchOfficialOnlyChange = (newSearchOfficialOnly: boolean): void => {
    setSearchOfficialOnly(newSearchOfficialOnly);
  };

  const handleCopyToClipboard = useCallback((newContentToCopy: string): void => {
    setContentToCopy(newContentToCopy);
  }, []);

  const handleContentCopied = useCallback((): void => {
    setContentToCopy(undefined);
  }, []);

  return (
    <>
      <Helmet>
        <title>Apps{query && ` (${query})`}</title>
      </Helmet>

      <CopyToClipboardHandler content={contentToCopy} onContentCopied={handleContentCopied} />

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
              searchOfficialOnly={searchOfficialOnly}
              onResultsChange={handleResultsChange}
              onSortChange={handleSortChange}
              onSearchOfficialOnlyChange={handleSearchOfficialOnlyChange}
            />
          </Col>
        </Row>

        <Row className="mt-2">
          <Col>
            {searchResults?.results.map((searchResult: ManifestJson) => (
              <SearchResult
                key={searchResult.id}
                result={searchResult}
                officialRepositories={officialRepositories}
                onCopyToClipbard={handleCopyToClipboard}
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
    </>
  );
};

export default React.memo(Search);
