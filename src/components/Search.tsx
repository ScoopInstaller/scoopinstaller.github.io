import React, { PureComponent } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';

import SearchBar from './SearchBar';
import SearchProcessor from './SearchProcessor';
import SearchPagination from './SearchPagination';
import SearchResult from './SearchResult';
import { SearchResultsJson } from '../serialization/SearchResultsJson';
import { ManifestJson } from '../serialization/ManifestJson';
import CopyToClipboardHandler from './CopyToClipboardHandler';

const RESULTS_PER_PAGE: number = 20;

class Search extends PureComponent<ISearchProps, ISearchState> {
  constructor(props: ISearchProps) {
    super(props);

    const sortIndex = parseInt(sessionStorage.getItem('sortIndex') || '0');

    this.state = {
      query: this.getCurrentQuery(),
      currentPage: this.getCurrentPage(),
      sortIndex: sortIndex,
    };
  }

  componentDidUpdate(prevProps: ISearchProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.setState({ query: this.getCurrentQuery() });
    }
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({ currentPage: this.getCurrentPage() });
    }
  }

  getCurrentQuery = () => {
    return this.props.location.search.length > 1
      ? decodeURIComponent(this.props.location.search.substr(1))
      : '';
  };

  getCurrentPage = () => {
    return parseInt(this.props.match.params.page || '1');
  };

  handleQueryChange = (query: string) => {
    this.props.history.replace({
      search: encodeURIComponent(query),
      pathname: '/apps',
    });
    this.setState({ query, currentPage: 1 });
  };

  handleResultsChange = (e?: SearchResultsJson) => {
    this.setState({ searchResults: e });
  };

  handlePageChange = (newPage: number) => {
    this.props.history.replace({
      pathname: `/apps/${newPage}`,
      search: this.props.location.search,
    });

    this.setState({ currentPage: newPage });
  };

  handleSortChange = (sortIndex: number) => {
    sessionStorage.setItem('sortIndex', sortIndex.toString());
    this.setState({ sortIndex: sortIndex });
  };

  handleCopyToClipboard = (content: string) => {
    this.setState({ contentToCopy: content });
  };

  handleContentCopied = () => {
    this.setState({ contentToCopy: undefined });
  };

  render() {
    return (
      <div className="Search">
        <CopyToClipboardHandler
          content={this.state.contentToCopy}
          onContentCopied={this.handleContentCopied}
        />

        <Container className="mt-5 mb-5">
          <Row className="justify-content-center">
            <Col sm={8}>
              <SearchBar
                query={this.state.query}
                onQueryChange={this.handleQueryChange}
              />
            </Col>
          </Row>

          <Row className="mt-5 mb-1">
            <Col>
              <SearchProcessor
                resultsPerPage={RESULTS_PER_PAGE}
                page={this.state.currentPage}
                query={this.state.query}
                sortIndex={this.state.sortIndex}
                onResultsChange={this.handleResultsChange}
                onSortIndexChange={this.handleSortChange}
              />
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center">
              <SearchPagination
                resultsPerPage={RESULTS_PER_PAGE}
                currentPage={this.state.currentPage}
                resultsCount={this.state.searchResults?.count}
                onPageChange={this.handlePageChange}
              />
            </Col>
          </Row>

          <Row className="mt-2">
            <Col>
              {this.state.searchResults?.results.map(
                (searchResult: ManifestJson) => (
                  <SearchResult
                    key={searchResult.id}
                    result={searchResult}
                    onCopyToClipbard={this.handleCopyToClipboard}
                  />
                )
              )}
            </Col>
          </Row>

          <Row>
            <Col className="d-flex justify-content-center">
              <SearchPagination
                resultsPerPage={RESULTS_PER_PAGE}
                currentPage={this.state.currentPage}
                resultsCount={this.state.searchResults?.count}
                onPageChange={this.handlePageChange}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

interface ISearchParams {
  page?: string;
}

interface ISearchProps extends RouteComponentProps<ISearchParams> {}

interface ISearchState {
  query: string;
  currentPage: number;
  sortIndex: number;
  searchResults?: SearchResultsJson;
  contentToCopy?: string;
}

export default Search;
