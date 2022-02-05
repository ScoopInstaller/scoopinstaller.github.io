import React, { useState, useEffect, useCallback } from 'react';

import { Container, Row, Col } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';

import ManifestJson from '../serialization/ManifestJson';
import SearchResultsJson from '../serialization/SearchResultsJson';
import CopyToClipboardHandler from './CopyToClipboardHandler';
import SearchBar from './SearchBar';
import SearchPagination from './SearchPagination';
import SearchProcessor from './SearchProcessor';
import SearchResult from './SearchResult';

const RESULTS_PER_PAGE = 20;

type SearchParams = {
  page?: string;
};

type SearchProps = RouteComponentProps<SearchParams>;

const Search = (props: SearchProps): JSX.Element => {
  const { history, location, match } = props;

  const initialSortIndex = parseInt(sessionStorage.getItem('sortIndex') || '0', 10);
  const initialSearchOfficialOnly = sessionStorage.getItem('searchOfficialOnly') === 'true';

  const getQueryFromUri = useCallback((): string => {
    return location.search.length > 1 ? decodeURIComponent(location.search.substr(1)) : '';
  }, [location.search]);

  const getCurrentPageFromUri = useCallback((): number => {
    return parseInt(match.params.page || '1', 10);
  }, [match]);

  const [searchBarQuery, setSearchBarQuery] = useState<string>(getQueryFromUri());
  const [query, setQuery] = useState<string>(getQueryFromUri());
  const [currentPage, setCurrentPage] = useState<number>(getCurrentPageFromUri);
  const [sortIndex, setSortIndex] = useState<number>(initialSortIndex);
  const [searchOfficialOnly, setSearchOfficialOnly] = useState<boolean>(initialSearchOfficialOnly);
  const [searchResults, setSearchResults] = useState<SearchResultsJson>();
  const [contentToCopy, setContentToCopy] = useState<string>();

  useEffect(() => {
    const queryfromUri = getQueryFromUri();
    setSearchBarQuery(queryfromUri);
    setQuery(queryfromUri);
  }, [location.search, getQueryFromUri]);

  useEffect(() => {
    setCurrentPage(getCurrentPageFromUri());
  }, [location.pathname, getCurrentPageFromUri]);

  const updateHistory = useCallback(
    (search: string | undefined = undefined, pathname: string | undefined = undefined): void => {
      history.replace({
        search: search ?? location.search,
        pathname: pathname ?? '/apps',
      });
    },
    [location.search, history]
  );

  const handleQueryChange = useCallback(
    (newQuery: string): void => {
      updateHistory(encodeURIComponent(newQuery), undefined);
      setSearchBarQuery(newQuery);
      setCurrentPage(1);
    },
    [updateHistory]
  );

  const handleQuerySubmit = useCallback((): void => {
    setQuery(searchBarQuery);
  }, [searchBarQuery]);

  const handleResultsChange = useCallback((e?: SearchResultsJson): void => {
    setSearchResults(e);
  }, []);

  const handlePageChange = useCallback(
    (newCurrentPage: number): void => {
      updateHistory(undefined, `/apps/${newCurrentPage}`);
      setCurrentPage(newCurrentPage);
    },
    [updateHistory]
  );

  const handleSortChange = useCallback((newSortIndex: number): void => {
    sessionStorage.setItem('sortIndex', newSortIndex.toString());
    setSortIndex(newSortIndex);
  }, []);

  const handleSearchOfficialOnlyChange = useCallback((newSearchOfficialOnly: boolean): void => {
    sessionStorage.setItem('searchOfficialOnly', newSearchOfficialOnly.toString());
    setSearchOfficialOnly(newSearchOfficialOnly);
  }, []);

  const handleCopyToClipboard = useCallback((newContentToCopy: string): void => {
    setContentToCopy(newContentToCopy);
  }, []);

  const handleContentCopied = useCallback((): void => {
    setContentToCopy(undefined);
  }, []);

  return (
    <div className="Search">
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
              query={query}
              sortIndex={sortIndex}
              searchOfficialOnly={searchOfficialOnly}
              onResultsChange={handleResultsChange}
              onSortIndexChange={handleSortChange}
              onSearchOfficialOnlyChange={handleSearchOfficialOnlyChange}
            />
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

        <Row className="mt-2">
          <Col>
            {searchResults?.results.map((searchResult: ManifestJson) => (
              <SearchResult key={searchResult.id} result={searchResult} onCopyToClipbard={handleCopyToClipboard} />
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
    </div>
  );
};

export default React.memo(Search);
