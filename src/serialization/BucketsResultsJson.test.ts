import { describe, expect, it } from 'vitest';
import { mockBucketsResponse } from '../__tests__/mocks/fixtures';
import BucketsResultsJson from './BucketsResultsJson';

describe('BucketsResultsJson', () => {
  describe('Create static method', () => {
    it('should deserialize buckets response with facets', () => {
      const result = BucketsResultsJson.Create(mockBucketsResponse);

      expect(result.count).toBe(3);
      expect(result.results).toBeDefined();
      expect(result.results['Metadata/OfficialRepository']).toBeDefined();
    });

    it('should deserialize facet results correctly', () => {
      const result = BucketsResultsJson.Create(mockBucketsResponse);

      const officialFacets = result.results['Metadata/OfficialRepository'];
      expect(officialFacets).toHaveLength(2);

      // Check first facet (true)
      expect(officialFacets[0].value).toBe(true);
      expect(officialFacets[0].count).toBe(2);

      // Check second facet (false)
      expect(officialFacets[1].value).toBe(false);
      expect(officialFacets[1].count).toBe(1);
    });

    it('should deserialize empty buckets response', () => {
      const emptyResponse = {
        '@odata.count': 0,
        '@search.facets': {},
      };

      const result = BucketsResultsJson.Create(emptyResponse);

      expect(result.count).toBe(0);
      expect(result.results).toEqual({});
    });

    it('should handle response with multiple facet types', () => {
      const multiResponse = {
        '@odata.count': 10,
        '@search.facets': {
          'Metadata/OfficialRepository': [
            { value: true, count: 5 },
            { value: false, count: 5 },
          ],
          'Metadata/RepositoryStars': [
            { value: '0-100', count: 3 },
            { value: '100-1000', count: 4 },
            { value: '1000+', count: 3 },
          ],
        },
      };

      const result = BucketsResultsJson.Create(multiResponse);

      expect(result.count).toBe(10);
      expect(result.results['Metadata/OfficialRepository']).toHaveLength(2);
      expect(result.results['Metadata/RepositoryStars']).toHaveLength(3);
    });

    it('should handle response with single facet value', () => {
      const singleFacetResponse = {
        '@odata.count': 1,
        '@search.facets': {
          'Metadata/OfficialRepository': [{ value: true, count: 1 }],
        },
      };

      const result = BucketsResultsJson.Create(singleFacetResponse);

      expect(result.count).toBe(1);
      expect(result.results['Metadata/OfficialRepository']).toHaveLength(1);
      expect(result.results['Metadata/OfficialRepository'][0].value).toBe(true);
      expect(result.results['Metadata/OfficialRepository'][0].count).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle facets with zero counts', () => {
      const response = {
        '@odata.count': 0,
        '@search.facets': {
          'Metadata/OfficialRepository': [
            { value: true, count: 0 },
            { value: false, count: 0 },
          ],
        },
      };

      const result = BucketsResultsJson.Create(response);

      expect(result.count).toBe(0);
      expect(result.results['Metadata/OfficialRepository'][0].count).toBe(0);
      expect(result.results['Metadata/OfficialRepository'][1].count).toBe(0);
    });

    it('should handle very large counts', () => {
      const response = {
        '@odata.count': 999999,
        '@search.facets': {
          'Metadata/OfficialRepository': [
            { value: true, count: 500000 },
            { value: false, count: 499999 },
          ],
        },
      };

      const result = BucketsResultsJson.Create(response);

      expect(result.count).toBe(999999);
      expect(result.results['Metadata/OfficialRepository'][0].count).toBe(500000);
    });

    it('should handle facets with special characters in keys', () => {
      const response = {
        '@odata.count': 5,
        '@search.facets': {
          'Metadata/Repository-Name': [{ value: 'test-repo/app', count: 5 }],
        },
      };

      const result = BucketsResultsJson.Create(response);

      expect(result.results['Metadata/Repository-Name']).toBeDefined();
      expect(result.results['Metadata/Repository-Name'][0].value).toBe('test-repo/app');
    });
  });
});
