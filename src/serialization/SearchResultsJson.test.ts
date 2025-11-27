import { describe, expect, it } from 'vitest';
import { createMockSearchResponse, mockEmptySearchResponse, mockSearchResponse } from '../__tests__/mocks/fixtures';
import SearchResultsJson from './SearchResultsJson';

describe('SearchResultsJson', () => {
  describe('Create static method', () => {
    it('should deserialize search response with results', () => {
      const result = SearchResultsJson.Create(mockSearchResponse);

      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].id).toBe('main/git');
      expect(result.results[0].name).toBe('git');
      expect(result.results[1].id).toBe('extras/github');
      expect(result.results[1].name).toBe('github');
    });

    it('should deserialize empty search response', () => {
      const result = SearchResultsJson.Create(mockEmptySearchResponse);

      expect(result.count).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it('should deserialize search response with single result', () => {
      const singleResult = createMockSearchResponse([
        {
          Id: 'main/test',
          '@search.score': 5.0,
          Name: 'test',
          NamePartial: 'test',
          NameSuffix: 'test',
          Version: '1.0.0',
          Metadata: {
            Repository: 'test/repo',
            OfficialRepository: false,
            RepositoryStars: 0,
            FilePath: 'bucket/test.json',
            Committed: '2024-01-01T00:00:00Z',
            Sha: 'abc123',
          },
        },
      ]);

      const result = SearchResultsJson.Create(singleResult);

      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].name).toBe('test');
    });

    it('should handle search response with count different from results length', () => {
      const response = createMockSearchResponse(
        [
          {
            Id: 'main/app1',
            '@search.score': 5.0,
            Name: 'app1',
            NamePartial: 'app1',
            NameSuffix: 'app1',
            Version: '1.0.0',
            Metadata: {
              Repository: 'test/repo',
              OfficialRepository: false,
              RepositoryStars: 0,
              FilePath: 'bucket/app1.json',
              Committed: '2024-01-01T00:00:00Z',
              Sha: 'abc',
            },
          },
        ],
        100 // Total count in Azure Search
      );

      const result = SearchResultsJson.Create(response);

      expect(result.count).toBe(100); // Total count
      expect(result.results).toHaveLength(1); // Actual results returned
    });
  });

  describe('deserialization of nested properties', () => {
    it('should deserialize results with all properties', () => {
      const result = SearchResultsJson.Create(mockSearchResponse);

      const firstResult = result.results[0];
      expect(firstResult.name).toBe('git');
      expect(firstResult.description).toBe('Distributed version control system');
      expect(firstResult.homepage).toBe('https://gitforwindows.org');
      expect(firstResult.license).toBe('GPL-2.0-only');
      expect(firstResult.version).toBe('2.43.0');
      expect(firstResult.score).toBe(10.5);
    });

    it('should deserialize metadata correctly', () => {
      const result = SearchResultsJson.Create(mockSearchResponse);

      const metadata = result.results[0].metadata;
      expect(metadata.repository).toBe('ScoopInstaller/Main');
      expect(metadata.repositoryOfficial).toBe(true);
      expect(metadata.stars).toBe(5000);
      expect(metadata.filePath).toBe('bucket/git.json');
      expect(metadata.committed).toBeInstanceOf(Date);
    });

    it('should preserve search highlights', () => {
      const result = SearchResultsJson.Create(mockSearchResponse);

      const firstResult = result.results[0];
      expect(firstResult.highlightedName).toBe('<em>git</em>');
      expect(firstResult.highlightedDescription).toBe('Distributed version control system');
    });
  });

  describe('edge cases', () => {
    it('should handle response with missing optional fields', () => {
      const minimalResponse = createMockSearchResponse([
        {
          Id: 'main/minimal',
          '@search.score': 1.0,
          Name: 'minimal',
          NamePartial: 'minimal',
          NameSuffix: 'minimal',
          Version: '1.0.0',
          Metadata: {
            Repository: 'test/repo',
            OfficialRepository: false,
            RepositoryStars: 0,
            FilePath: 'bucket/minimal.json',
            Committed: '2024-01-01T00:00:00Z',
            Sha: 'abc',
          },
        },
      ]);

      const result = SearchResultsJson.Create(minimalResponse);

      expect(result.count).toBe(1);
      expect(result.results[0].name).toBe('minimal');
      expect(result.results[0].description).toBeUndefined();
      expect(result.results[0].homepage).toBeUndefined();
      expect(result.results[0].license).toBeUndefined();
    });

    it('should handle large result sets', () => {
      const largeResults = Array.from({ length: 100 }, (_, i) => ({
        Id: `main/app${i}`,
        '@search.score': 10 - i * 0.1,
        Name: `app${i}`,
        NamePartial: `app${i}`,
        NameSuffix: `app${i}`,
        Version: '1.0.0',
        Metadata: {
          Repository: 'test/repo',
          OfficialRepository: false,
          RepositoryStars: i * 10,
          FilePath: `bucket/app${i}.json`,
          Committed: '2024-01-01T00:00:00Z',
          Sha: `abc${i}`,
        },
      }));

      const response = createMockSearchResponse(largeResults, 1000);
      const result = SearchResultsJson.Create(response);

      expect(result.count).toBe(1000);
      expect(result.results).toHaveLength(100);
    });
  });
});
