import React, { PureComponent } from 'react';

import { Container, Col, Row, InputGroup, Form } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';

import BucketsResultsJson from '../serialization/BucketsResultsJson';
import Utils from '../utils';
import BucketTypeIcon from './BucketTypeIcon';
import SearchStatus, { SearchStatusType } from './SearchStatus';

type Bucket = {
  bucket: string;
  manifests: number;
  official: boolean;
};

type BucketsState = {
  searching: boolean;
  sortIndex: number;
  results: Bucket[];
};

class Buckets extends PureComponent<unknown, BucketsState> {
  private abortController: AbortController = new AbortController();

  private sortModes: string[] = ['Default', 'Name', 'Manifests'];

  constructor(props: unknown) {
    super(props);

    this.state = {
      searching: false,
      sortIndex: 0,
      results: [],
    };
  }

  async componentDidMount(): Promise<void> {
    const { sortIndex } = this.state;

    this.setState({
      searching: true,
      results: [],
    });

    const officialBuckets = await this.fetchDataAsync(
      this.abortController.signal,
      true
    );
    const communityBuckets = await this.fetchDataAsync(
      this.abortController.signal,
      false
    );

    let results: Bucket[] = officialBuckets.results['Metadata/Repository']
      .map<Bucket>((item) => {
        return { bucket: item.value, manifests: item.count, official: true };
      })
      .concat(
        communityBuckets.results['Metadata/Repository'].map<Bucket>((item) => {
          return { bucket: item.value, manifests: item.count, official: false };
        })
      );

    results = this.sortResults(results, sortIndex);
    this.setState({
      searching: false,
      results,
    });
  }

  componentWillUnmount(): void {
    this.abortController.abort();
  }

  handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { results } = this.state;
    const sortOrder = e.target.selectedIndex;
    this.setState({
      sortIndex: sortOrder,
      results: this.sortResults(results, sortOrder),
    });
  };

  // eslint-disable-next-line class-methods-use-this
  async fetchDataAsync(
    abortSignal: AbortSignal,
    officialRepository: boolean
  ): Promise<BucketsResultsJson> {
    const { REACT_APP_AZURESEARCH_URL, REACT_APP_AZURESEARCH_KEY } =
      process.env;

    if (!REACT_APP_AZURESEARCH_URL) {
      throw new Error('REACT_APP_AZURESEARCH_URL is not defined');
    }

    if (!REACT_APP_AZURESEARCH_KEY) {
      throw new Error('REACT_APP_AZURESEARCH_KEY is not defined');
    }

    const url = `${REACT_APP_AZURESEARCH_URL}/search?api-version=2020-06-30`;

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        count: true,
        facets: ['Metadata/Repository,count:10000'],
        filter: `Metadata/OfficialRepositoryNumber eq ${
          officialRepository ? '1' : '0'
        }`,
        top: 0, // Don't retrieve actual data
      }),
      headers: {
        'api-key': REACT_APP_AZURESEARCH_KEY,
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
    });
    const data = (await response.json()) as unknown;
    return BucketsResultsJson.Create(data);
  }

  // eslint-disable-next-line class-methods-use-this
  sortResults(results: Bucket[], sortOrder: number): Bucket[] {
    switch (sortOrder) {
      case 0:
        return results.sort((x, y) => {
          if (x.official === y.official) {
            return x.bucket.localeCompare(y.bucket);
          }
          if (x.official < y.official) {
            return 1;
          }

          return -1;
        });

      case 1:
        return results.sort((x, y) => x.bucket.localeCompare(y.bucket));

      case 2:
        return results.sort((x, y) => {
          if (x.manifests === y.manifests) {
            return 0;
          }
          if (x.manifests < y.manifests) {
            return 1;
          }

          return -1;
        });
      default:
        throw new Error('Unexpected sort');
    }
  }

  render(): JSX.Element {
    const { results, searching } = this.state;
    return (
      <>
        <Container className="mt-5 mb-5">
          <Row>
            <Col className="my-auto">
              <SearchStatus
                resultsCount={results.length}
                searching={searching}
                type={SearchStatusType.Buckets}
              />
            </Col>
            <Col lg={3}>
              <InputGroup size="sm">
                <InputGroup.Text>Sort by</InputGroup.Text>
                <Form.Select size="sm" onChange={this.handleSortChange}>
                  {this.sortModes.map((item, idx) => (
                    <option key={item} value={idx}>
                      {item}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          {results && (
            <Row className="mt-2">
              <Col>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Bucket</th>
                      <th>Manifests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item: Bucket) => (
                      <tr key={item.bucket}>
                        <td>
                          <Link
                            to={{
                              pathname: '/apps',
                              search: encodeURIComponent(`"${item.bucket}"`),
                            }}
                          >
                            {Utils.extractPathFromUrl(item.bucket)}
                          </Link>{' '}
                          <BucketTypeIcon official={item.official} />
                        </td>
                        <td>{item.manifests}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </Container>
      </>
    );
  }
}

export default Buckets;
