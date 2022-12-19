import React, { useState, useEffect, useRef } from 'react';

import { Container, Col, Row, InputGroup, Form } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { Helmet } from 'react-helmet';
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

const sortModes: string[] = ['Default', 'Name', 'Manifests'];

const Buckets = (): JSX.Element => {
  const abortControllerRef = useRef<AbortController>(new AbortController());
  const [searching, setSearching] = useState<boolean>(false);
  const [sortIndex, setSortIndex] = useState<number>(0);
  const [results, setResults] = useState<Bucket[]>([]);

  const sortResults = (buckets: Bucket[], sortOrder: number): Bucket[] => {
    switch (sortOrder) {
      case 0:
        return buckets.sort((x, y) => {
          if (x.official === y.official) {
            return x.bucket.localeCompare(y.bucket);
          }
          if (x.official < y.official) {
            return 1;
          }

          return -1;
        });

      case 1:
        return buckets.sort((x, y) => x.bucket.localeCompare(y.bucket));

      case 2:
        return buckets.sort((x, y) => {
          if (x.manifests === y.manifests) {
            return 0;
          }
          if (x.manifests < y.manifests) {
            return 1;
          }

          return -1;
        });
      default:
        throw new Error('Unexpected sort mode');
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const sortOrder = e.target.selectedIndex;
    setSortIndex(sortOrder);
    setResults((previousResults) => sortResults(previousResults, sortOrder));
  };

  useEffect(() => {
    setSearching(true);
    setResults([]);

    const fetchDataAsync = async (
      abortSignal: AbortSignal,
      officialRepository: boolean
    ): Promise<BucketsResultsJson> => {
      const { VITE_APP_AZURESEARCH_URL, VITE_APP_AZURESEARCH_KEY } = import.meta.env;

      if (!VITE_APP_AZURESEARCH_URL) {
        throw new Error('VITE_APP_AZURESEARCH_URL is not defined');
      }

      if (!VITE_APP_AZURESEARCH_KEY) {
        throw new Error('VITE_APP_AZURESEARCH_KEY is not defined');
      }

      const url = `${VITE_APP_AZURESEARCH_URL}/search?api-version=2020-06-30`;

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          count: true,
          facets: ['Metadata/Repository,count:10000'],
          filter: `Metadata/OfficialRepositoryNumber eq ${officialRepository ? '1' : '0'}`,
          top: 0, // Don't retrieve actual data
        }),
        headers: {
          'api-key': VITE_APP_AZURESEARCH_KEY,
          'Content-Type': 'application/json',
        },
        signal: abortSignal,
      });
      const data = (await response.json()) as unknown;
      return BucketsResultsJson.Create(data);
    };

    const fetchAsync = async (abortSignal: AbortSignal): Promise<Bucket[]> => {
      const officialBuckets = await fetchDataAsync(abortSignal, true);
      const communityBuckets = await fetchDataAsync(abortSignal, false);

      return officialBuckets.results['Metadata/Repository']
        .map<Bucket>((item) => {
          return { bucket: item.value, manifests: item.count, official: true };
        })
        .concat(
          communityBuckets.results['Metadata/Repository'].map<Bucket>((item) => {
            return { bucket: item.value, manifests: item.count, official: false };
          })
        );
    };

    fetchAsync(abortControllerRef.current.signal)
      .then((buckets) => setResults(sortResults(buckets, sortIndex)))
      .finally(() => setSearching(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => abortControllerRef.current.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Buckets</title>
      </Helmet>
      <Container className="mt-5 mb-5">
        <Row>
          <Col className="my-auto">
            <SearchStatus resultsCount={results.length} searching={searching} type={SearchStatusType.Buckets} />
          </Col>
          <Col lg={3}>
            <InputGroup size="sm">
              <InputGroup.Text>Sort by</InputGroup.Text>
              <Form.Select size="sm" onChange={handleSortChange}>
                {sortModes.map((item, idx) => (
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
                            search: `?q="${encodeURIComponent(item.bucket)}"`,
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
};

export default React.memo(Buckets);
