import React, { PureComponent } from 'react';
import {
  ISearchProcessorProps,
  ISearchProcessorState,
} from '../interfaces/ISearchProcessor.interfaces';

import { Col, Row, Form, InputGroup } from 'react-bootstrap';
import SearchStatus from './SearchStatus';
import { SearchResultsJson } from '../serialization/SearchResultsJson';

class SearchProcessor extends PureComponent<
  ISearchProcessorProps,
  ISearchProcessorState
> {
  private abortController: AbortController = new AbortController();

  private sortModes: ISortMode[] = [
    {
      DisplayName: 'Best match',
      OrderBy: [
        'search.score() desc',
        'Metadata/OfficialRepositoryNumber desc',
        'NameNormalized asc',
      ],
    },
    {
      DisplayName: 'Name',
      OrderBy: [
        'NameNormalized asc',
        'Metadata/OfficialRepositoryNumber desc',
        'Metadata/RepositoryStars desc',
        'Metadata/Committed desc',
      ],
    },
    {
      DisplayName: 'Newest',
      OrderBy: [
        'Metadata/Committed desc',
        'Metadata/OfficialRepositoryNumber desc',
        'Metadata/RepositoryStars desc',
      ],
    },
  ];

  constructor(props: ISearchProcessorProps) {
    super(props);

    this.state = {
      resultsCount: undefined,
      searching: false,
    };
  }

  componentDidMount() {
    this.fetchDataAsync(this.abortController.signal, this.props.query);
  }

  componentDidUpdate(
    prevProps: ISearchProcessorProps,
    prevState: ISearchProcessorState
  ) {
    if (
      this.props.query !== prevProps.query ||
      this.props.page !== prevProps.page ||
      this.props.sortIndex !== prevProps.sortIndex
    ) {
      this.abortController.abort();
      this.abortController = new AbortController();
      this.fetchDataAsync(this.abortController.signal, this.props.query);
    }
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onSortIndexChange(e.target.selectedIndex);
  };

  fetchDataAsync(abortSignal: AbortSignal, query: string) {
    this.setState({
      searching: true,
    });

    const url = `${process.env.REACT_APP_AZURESEARCH_URL}/search?api-version=2020-06-30`;

    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        count: true,
        search: query.trim(),
        searchMode: 'all',
        orderby: this.sortModes[this.props.sortIndex].OrderBy.join(', '),
        skip: (this.props.page - 1) * this.props.resultsPerPage,
        top: this.props.resultsPerPage,
        select: [
          'Id',
          'NameStandard',
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
          'Metadata/Committed',
          'Metadata/Sha',
        ].join(','),
        highlight: [
          'NameStandard',
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
        'api-key': process.env.REACT_APP_AZURESEARCH_KEY!,
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

        this.setState({
          searching: false,
          resultsCount: results.count,
        });
        this.props.onResultsChange(results);
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          this.setState({
            searching: false,
            resultsCount: undefined,
          });
          this.props.onResultsChange(undefined);
          console.error(error);
        }
      });
  }

  render() {
    return (
      <Form>
        <Row>
          <Col className="my-auto">
            <SearchStatus
              query={this.props.query}
              resultsCount={this.state.resultsCount!}
              searching={this.state.searching!}
            />
          </Col>
          <Col lg={3}>
            <InputGroup size="sm">
              <InputGroup.Prepend>
                <InputGroup.Text>Sort by</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                as="select"
                size="sm"
                custom
                value={this.props.sortIndex}
                onChange={this.handleSortChange}
              >
                {this.sortModes.map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item.DisplayName}
                  </option>
                ))}
              </Form.Control>
            </InputGroup>
          </Col>
        </Row>
      </Form>
    );
  }
}

interface ISortMode {
  DisplayName: string;
  OrderBy: string[];
}

export default SearchProcessor;
