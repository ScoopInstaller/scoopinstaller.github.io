import { PureComponent } from 'react';

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

type SearchState = {
  searchBarQuery: string;
  query: string;
  currentPage: number;
  sortIndex: number;
  searchOfficialOnly: boolean;
  searchResults?: SearchResultsJson;
  contentToCopy?: string;
};

class Search extends PureComponent<SearchProps, SearchState> {
  constructor(props: SearchProps) {
    super(props);

    const sortIndex = parseInt(sessionStorage.getItem('sortIndex') || '0', 10);
    const searchOfficialOnly = sessionStorage.getItem('searchOfficialOnly') === 'true';
    const queryfromUri = this.getQueryFromUri();

    this.state = {
      searchBarQuery: queryfromUri,
      query: queryfromUri,
      currentPage: this.getCurrentPageFromUri(),
      sortIndex,
      searchOfficialOnly,
    };
  }

  componentDidUpdate(prevProps: SearchProps): void {
    // Used when url is updated manually
    const { location } = this.props;
    const queryfromUri = this.getQueryFromUri();
    if (prevProps.location.search !== location.search) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        searchBarQuery: queryfromUri,
        query: queryfromUri,
      });
    }
    if (prevProps.location.pathname !== location.pathname) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ currentPage: this.getCurrentPageFromUri() });
    }
  }

  getQueryFromUri = (): string => {
    const { location } = this.props;
    return location.search.length > 1 ? decodeURIComponent(location.search.substr(1)) : '';
  };

  getCurrentPageFromUri = (): number => {
    const { match } = this.props;
    return parseInt(match.params.page || '1', 10);
  };

  updateHistory = (search: string | undefined = undefined, pathname: string | undefined = undefined): void => {
    const { history, location } = this.props;
    history.replace({
      search: search ?? location.search,
      pathname: pathname ?? '/apps',
    });
  };

  handleQueryChange = (query: string): void => {
    this.updateHistory(encodeURIComponent(query), undefined);
    this.setState({ searchBarQuery: query, currentPage: 1 });
  };

  handleQuerySubmit = (): void => {
    const { searchBarQuery } = this.state;
    this.setState({ query: searchBarQuery });
  };

  handleResultsChange = (e?: SearchResultsJson): void => {
    this.setState({ searchResults: e });
  };

  handlePageChange = (newPage: number): void => {
    this.updateHistory(undefined, `/apps/${newPage}`);
    this.setState({ currentPage: newPage });
  };

  handleSortChange = (sortIndex: number): void => {
    sessionStorage.setItem('sortIndex', sortIndex.toString());
    this.setState({ sortIndex });
  };

  handleSearchOfficialOnlyChange = (searchOfficialOnly: boolean): void => {
    sessionStorage.setItem('searchOfficialOnly', searchOfficialOnly.toString());
    this.setState({ searchOfficialOnly });
  };

  handleCopyToClipboard = (content: string): void => {
    this.setState({ contentToCopy: content });
  };

  handleContentCopied = (): void => {
    this.setState({ contentToCopy: undefined });
  };

  render(): JSX.Element {
    const { contentToCopy, searchBarQuery, query, currentPage, sortIndex, searchOfficialOnly, searchResults } =
      this.state;
    return (
      <div className="Search">
        <CopyToClipboardHandler content={contentToCopy} onContentCopied={this.handleContentCopied} />

        <Container className="mt-5 mb-5">
          <Row className="justify-content-center">
            <Col sm={8}>
              <SearchBar
                query={searchBarQuery}
                onQueryChange={this.handleQueryChange}
                onSubmit={this.handleQuerySubmit}
              />
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
                onResultsChange={this.handleResultsChange}
                onSortIndexChange={this.handleSortChange}
                onSearchOfficialOnlyChange={this.handleSearchOfficialOnlyChange}
              />
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center">
              <SearchPagination
                resultsPerPage={RESULTS_PER_PAGE}
                currentPage={currentPage}
                resultsCount={searchResults?.count ?? 0}
                onPageChange={this.handlePageChange}
              />
            </Col>
          </Row>

          <Row className="mt-2">
            <Col>
              {searchResults?.results.map((searchResult: ManifestJson) => (
                <SearchResult
                  key={searchResult.id}
                  result={searchResult}
                  onCopyToClipbard={this.handleCopyToClipboard}
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
                onPageChange={this.handlePageChange}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Search;
