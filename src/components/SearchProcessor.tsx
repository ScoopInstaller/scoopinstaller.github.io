import React, { PureComponent } from 'react';

import { Col, Row, Form, InputGroup } from 'react-bootstrap';

import SearchResultsJson from '../serialization/SearchResultsJson';
import SearchStatus, { SearchStatusType } from './SearchStatus';

type SortMode = {
  DisplayName: string;
  OrderBy: string[];
};

type SearchProcessorProps = {
  page: number;
  query: string;
  sortIndex: number;
  resultsPerPage: number;
  onResultsChange: (value?: SearchResultsJson) => void;
  onSortIndexChange: (sortIndex: number) => void;
};

type SearchProcessorState = {
  resultsCount: number;
  searching: boolean;
};

class SearchProcessor extends PureComponent<
  SearchProcessorProps,
  SearchProcessorState
> {
  private abortController: AbortController = new AbortController();

  private sortModes: SortMode[] = [
    {
      DisplayName: 'Best match',
      OrderBy: [
        'search.score() desc',
        'Metadata/OfficialRepositoryNumber desc',
        'NameSortable asc',
      ],
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
      OrderBy: [
        'Metadata/Committed desc',
        'Metadata/OfficialRepositoryNumber desc',
        'Metadata/RepositoryStars desc',
      ],
    },
  ];

  constructor(props: SearchProcessorProps) {
    super(props);

    this.state = {
      resultsCount: 0,
      searching: false,
    };
  }

  componentDidMount(): void {
    const { query } = this.props;
    this.fetchDataAsync(this.abortController.signal, query);
  }

  componentDidUpdate(
    prevProps: SearchProcessorProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prevState: SearchProcessorState
  ): void {
    const { query, page, sortIndex } = this.props;
    if (
      query !== prevProps.query ||
      page !== prevProps.page ||
      sortIndex !== prevProps.sortIndex
    ) {
      this.abortController.abort();
      this.abortController = new AbortController();
      this.fetchDataAsync(this.abortController.signal, query);
    }
  }

  componentWillUnmount(): void {
    this.abortController.abort();
  }

  handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { onSortIndexChange } = this.props;
    onSortIndexChange(e.target.selectedIndex);
  };

  fetchDataAsync(abortSignal: AbortSignal, query: string): void {
    this.setState({
      searching: true,
    });

    const {
      REACT_APP_AZURESEARCH_URL,
      REACT_APP_AZURESEARCH_KEY,
    } = process.env;

    if (!REACT_APP_AZURESEARCH_URL) {
      throw new Error('REACT_APP_AZURESEARCH_URL is not defined');
    }

    if (!REACT_APP_AZURESEARCH_KEY) {
      throw new Error('REACT_APP_AZURESEARCH_KEY is not defined');
    }

    const url = `${REACT_APP_AZURESEARCH_URL}/search?api-version=2020-06-30`;
    const { sortIndex, page, resultsPerPage, onResultsChange } = this.props;
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        count: true,
        search: query.trim(),
        searchMode: 'all',
        orderby: this.sortModes[sortIndex].OrderBy.join(', '),
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

        this.setState({
          searching: false,
          resultsCount: results.count,
        });
        onResultsChange(results);
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          this.setState({
            searching: false,
            resultsCount: 0,
          });
          onResultsChange(undefined);
        }
      });
  }

  render(): JSX.Element {
    const { query, sortIndex } = this.props;
    const { resultsCount, searching } = this.state;
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
            <InputGroup size="sm">
              <InputGroup.Prepend>
                <InputGroup.Text>Sort by</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                as="select"
                size="sm"
                custom
                value={sortIndex}
                onChange={this.handleSortChange}
              >
                {this.sortModes.map((item, idx) => (
                  <option key={item.DisplayName} value={idx}>
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

export default SearchProcessor;
