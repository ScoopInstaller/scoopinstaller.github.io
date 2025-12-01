import { JsonConvert } from 'json2typescript';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockManifest } from '../__tests__/mocks/fixtures';
import ManifestJson from './ManifestJson';

describe('ManifestJson', () => {
  let jsonConvert: JsonConvert;

  beforeEach(() => {
    jsonConvert = new JsonConvert();
  });

  describe('deserialization', () => {
    it('should deserialize a complete manifest', () => {
      const result = jsonConvert.deserializeObject(mockManifest, ManifestJson);

      expect(result.id).toBe('main/nodejs');
      expect(result.name).toBe('nodejs');
      expect(result.description).toBe('JavaScript runtime environment');
      expect(result.homepage).toBe('https://nodejs.org');
      expect(result.license).toBe('MIT');
      expect(result.version).toBe('20.11.0');
      expect(result.score).toBe(12.0);
    });

    it('should deserialize manifest with optional fields missing', () => {
      const minimalManifest = {
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
      };

      const result = jsonConvert.deserializeObject(minimalManifest, ManifestJson);

      expect(result.id).toBe('main/test');
      expect(result.description).toBeUndefined();
      expect(result.homepage).toBeUndefined();
      expect(result.license).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });

    it('should deserialize metadata correctly', () => {
      const result = jsonConvert.deserializeObject(mockManifest, ManifestJson);

      expect(result.metadata.repository).toBe('ScoopInstaller/Main');
      expect(result.metadata.repositoryOfficial).toBe(true);
      expect(result.metadata.stars).toBe(5000);
      expect(result.metadata.filePath).toBe('bucket/nodejs.json');
      expect(result.metadata.sha).toBe('xyz789abc123');
    });
  });

  describe('highlight getters', () => {
    it('should return highlighted name when available', () => {
      const manifestWithHighlights = {
        ...mockManifest,
        '@search.highlights': {
          Name: ['<em>node</em>js'],
        },
      };

      const result = jsonConvert.deserializeObject(manifestWithHighlights, ManifestJson);

      expect(result.highlightedName).toBe('<em>node</em>js');
    });

    it('should fallback to name when highlight not available', () => {
      const result = jsonConvert.deserializeObject(mockManifest, ManifestJson);

      expect(result.highlightedName).toBe('nodejs');
    });

    it('should return highlighted description when available', () => {
      const manifestWithHighlights = {
        ...mockManifest,
        '@search.highlights': {
          Description: ['JavaScript <em>runtime</em> environment'],
        },
      };

      const result = jsonConvert.deserializeObject(manifestWithHighlights, ManifestJson);

      expect(result.highlightedDescription).toBe('JavaScript <em>runtime</em> environment');
    });

    it('should return highlighted license when available', () => {
      const manifestWithHighlights = {
        ...mockManifest,
        '@search.highlights': {
          License: ['<em>MIT</em>'],
        },
      };

      const result = jsonConvert.deserializeObject(manifestWithHighlights, ManifestJson);

      expect(result.highlightedLicense).toBe('<em>MIT</em>');
    });

    it('should return highlighted repository when available', () => {
      const manifestWithHighlights = {
        ...mockManifest,
        '@search.highlights': {
          'Metadata/Repository': ['ScoopInstaller/<em>Main</em>'],
        },
      };

      const result = jsonConvert.deserializeObject(manifestWithHighlights, ManifestJson);

      expect(result.highlightedRepository).toBe('ScoopInstaller/<em>Main</em>');
    });

    it('should return highlighted version or "Unknown" when version is empty', () => {
      const manifestWithoutVersion = {
        ...mockManifest,
        Version: '',
      };

      const result = jsonConvert.deserializeObject(manifestWithoutVersion, ManifestJson);

      expect(result.highlightedVersion).toBe('Unknown');
    });

    it('should try multiple highlight properties for name', () => {
      const manifestWithPartialHighlight = {
        ...mockManifest,
        '@search.highlights': {
          NamePartial: ['<em>node</em>'],
        },
      };

      const result = jsonConvert.deserializeObject(manifestWithPartialHighlight, ManifestJson);

      expect(result.highlightedName).toBe('<em>node</em>');
    });

    it('should join multiple highlight values', () => {
      const manifestWithMultipleHighlights = {
        ...mockManifest,
        '@search.highlights': {
          Name: ['<em>node</em>', 'js'],
        },
      };

      const result = jsonConvert.deserializeObject(manifestWithMultipleHighlights, ManifestJson);

      expect(result.highlightedName).toBe('<em>node</em> js');
    });
  });

  describe('favicon getter', () => {
    it('should generate favicon URL from homepage', () => {
      const result = jsonConvert.deserializeObject(mockManifest, ManifestJson);

      expect(result.favicon).toBe('https://nodejs.org/favicon.ico');
    });

    it('should return undefined when homepage is not set', () => {
      const manifestWithoutHomepage = {
        ...mockManifest,
        Homepage: undefined,
      };

      const result = jsonConvert.deserializeObject(manifestWithoutHomepage, ManifestJson);

      expect(result.favicon).toBeUndefined();
    });

    it('should extract origin correctly for different URLs', () => {
      const manifestWithSubpath = {
        ...mockManifest,
        Homepage: 'https://example.com/some/path',
      };

      const result = jsonConvert.deserializeObject(manifestWithSubpath, ManifestJson);

      expect(result.favicon).toBe('https://example.com/favicon.ico');
    });

    it('should handle URLs with ports', () => {
      const manifestWithPort = {
        ...mockManifest,
        Homepage: 'http://localhost:3000/app',
      };

      const result = jsonConvert.deserializeObject(manifestWithPort, ManifestJson);

      expect(result.favicon).toBe('http://localhost:3000/favicon.ico');
    });
  });
});
