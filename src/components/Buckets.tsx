import React, { PureComponent } from 'react';
import Table from 'react-bootstrap/Table';
import { Container, Col, Row, InputGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { BucketsResultsJson } from '../serialization/BucketsResultsJson';
import SearchStatus from './SearchStatus';
import { KnownBucketIcon } from './KnownBucketIcon';

class Buckets extends PureComponent<{}, IBucketsState> {
  private abortController: AbortController = new AbortController();

  constructor(props: {}) {
    super(props);

    this.state = {
      searching: false,
      sortIndex: 0,
      results: [],
    };
  }

  private sortModes: string[] = ['Default', 'Name', 'Manifests'];

  async componentDidMount() {
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

    let results: IBucket[] = officialBuckets.results['Metadata/Repository']
      .map<IBucket>((item) => {
        return { bucket: item.value, manifests: item.count, official: true };
      })
      .concat(
        communityBuckets.results['Metadata/Repository'].map<IBucket>((item) => {
          return { bucket: item.value, manifests: item.count, official: false };
        })
      );

    results = this.sortResults(results, this.state.sortIndex);
    this.setState({
      searching: false,
      results: results,
    });
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  async fetchDataAsync(abortSignal: AbortSignal, officialRepository: boolean) {
    const url = `${process.env.REACT_APP_AZURESEARCH_URL}/search?api-version=2020-06-30`;

    let response = await fetch(url, {
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
        'api-key': process.env.REACT_APP_AZURESEARCH_KEY!,
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
    });
    const data = await response.json();
    return BucketsResultsJson.Create(data);
  }

  sortResults(results: IBucket[], sortOrder: number): IBucket[] {
    switch (sortOrder) {
      case 0:
        return results.sort((x, y) =>
          x.official === y.official
            ? x.bucket.localeCompare(y.bucket)
            : x.official < y.official
            ? 1
            : -1
        );

      case 1:
        return results.sort((x, y) => x.bucket.localeCompare(y.bucket));

      case 2:
        return results.sort((x, y) =>
          x.manifests === y.manifests ? 0 : x.manifests < y.manifests ? 1 : -1
        );
      default:
        throw new Error('Unexpected sort');
    }
  }

  handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortOrder = e.target.selectedIndex;
    this.setState({
      sortIndex: sortOrder,
      results: this.sortResults(this.state.results, sortOrder),
    });
  };

  render() {
    return (
      <React.Fragment>
        <Container className="mt-5 mb-5">
          <Row>
            <Col className="my-auto">
              <SearchStatus
                resultsCount={this.state.results.length}
                searching={this.state.searching}
                type="buckets"
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
                  onChange={this.handleSortChange}
                >
                  {this.sortModes.map((item, idx) => (
                    <option key={idx} value={idx}>
                      {item}
                    </option>
                  ))}
                </Form.Control>
              </InputGroup>
            </Col>
          </Row>

          {this.state.results && (
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
                    {this.state.results.map((item: IBucket) => (
                      <tr>
                        <td>
                          <Link
                            to={{
                              pathname: '/apps',
                              search: encodeURIComponent(`"${item.bucket}"`),
                            }}
                          >
                            {item.bucket}
                          </Link>{' '}
                          {item.official && <KnownBucketIcon />}
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
      </React.Fragment>
    );
  }
}

interface IBucket {
  bucket: string;
  manifests: number;
  official: boolean;
}

interface IBucketsState {
  searching: boolean;
  sortIndex: number;
  results: IBucket[];
}

export default Buckets;
