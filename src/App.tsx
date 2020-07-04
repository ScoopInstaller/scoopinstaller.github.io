import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { IAppState } from './interfaces/IApp.interfaces';
import './App.css';

import NavBar from './components/NavBar';
import SearchBar from './components/SearchBar';
import { Container, Row, Col } from 'react-bootstrap';
import SearchProcessor from './components/SearchProcessor';
import SearchPagination from './components/SearchPagination';
import SearchResult from './components/SearchResult';
import { SearchResultsJson } from './serialization/SearchResultsJson';
import { ManifestJson } from './serialization/ManifestJson';

const RESULTS_PER_PAGE: number = 20;
const GA_ID: string = 'UA-171643529-1';

class App extends Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);

    ReactGA.initialize(GA_ID);

    const query = sessionStorage.getItem('query') || '';
    const currentPage = parseInt(sessionStorage.getItem('currentPage') || '1');
    const sortIndex = parseInt(sessionStorage.getItem('sortIndex') || '0');
    this.state = {
      query: query,
      currentPage: currentPage,
      sortIndex: sortIndex,
    };
  }

  handleQueryChange = (query: string) => {
    sessionStorage.setItem('query', query);
    this.setState({ query, currentPage: 1 });
  };

  handleResultsChange = (e?: SearchResultsJson) => {
    this.setState({ searchResults: e });
  };

  handlePageChange = (newPage: number) => {
    sessionStorage.setItem('currentPage', newPage.toString());
    this.setState({ currentPage: newPage });
  };

  handleSortChange = (sortIndex: number) => {
    sessionStorage.setItem('sortIndex', sortIndex.toString());
    this.setState({ sortIndex: sortIndex });
  };

  render() {
    return (
      <div className="App">
        <NavBar />

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
                  <SearchResult key={searchResult.id} result={searchResult} />
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

export default App;
