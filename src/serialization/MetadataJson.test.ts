import { JsonConvert } from 'json2typescript';
import { beforeEach, describe, expect, it } from 'vitest';
import MetadataJson from './MetadataJson';

describe('MetadataJson', () => {
  let jsonConvert: JsonConvert;

  beforeEach(() => {
    jsonConvert = new JsonConvert();
  });

  describe('deserialization', () => {
    it('should deserialize complete metadata', () => {
      const metadata = {
        Repository: 'ScoopInstaller/Main',
        OfficialRepository: true,
        RepositoryStars: 5000,
        BranchName: 'master',
        FilePath: 'bucket/git.json',
        Committed: '2024-01-15T10:30:00Z',
        Sha: 'abc123def456',
      };

      const result = jsonConvert.deserializeObject(metadata, MetadataJson);

      expect(result.repository).toBe('ScoopInstaller/Main');
      expect(result.repositoryOfficial).toBe(true);
      expect(result.stars).toBe(5000);
      expect(result.branchName).toBe('master');
      expect(result.filePath).toBe('bucket/git.json');
      expect(result.sha).toBe('abc123def456');
      expect(result.committed).toBeInstanceOf(Date);
    });

    it('should deserialize metadata with optional fields', () => {
      const metadata = {
        Repository: 'user/repo',
        OfficialRepository: false,
        RepositoryStars: 0,
        FilePath: 'bucket/app.json',
        Committed: '2024-01-01T00:00:00Z',
        Sha: 'xyz789',
      };

      const result = jsonConvert.deserializeObject(metadata, MetadataJson);

      expect(result.repository).toBe('user/repo');
      expect(result.repositoryOfficial).toBe(false);
      expect(result.stars).toBe(0);
      expect(result.branchName).toBe('');
    });

    it('should convert committed date string to Date object', () => {
      const metadata = {
        Repository: 'test/repo',
        OfficialRepository: false,
        RepositoryStars: 100,
        FilePath: 'bucket/test.json',
        Committed: '2024-01-15T10:30:00Z',
        Sha: 'abc123',
      };

      const result = jsonConvert.deserializeObject(metadata, MetadataJson);

      expect(result.committed).toBeInstanceOf(Date);
      expect(result.committed.getFullYear()).toBe(2024);
      expect(result.committed.getMonth()).toBe(0); // January = 0
      expect(result.committed.getDate()).toBe(15);
    });
  });

  describe('official repository handling', () => {
    it('should correctly identify official repository', () => {
      const metadata = {
        Repository: 'ScoopInstaller/Main',
        OfficialRepository: true,
        RepositoryStars: 5000,
        FilePath: 'bucket/app.json',
        Committed: '2024-01-01T00:00:00Z',
        Sha: 'abc',
      };

      const result = jsonConvert.deserializeObject(metadata, MetadataJson);

      expect(result.repositoryOfficial).toBe(true);
    });

    it('should correctly identify non-official repository', () => {
      const metadata = {
        Repository: 'user/custom-bucket',
        OfficialRepository: false,
        RepositoryStars: 50,
        FilePath: 'bucket/app.json',
        Committed: '2024-01-01T00:00:00Z',
        Sha: 'xyz',
      };

      const result = jsonConvert.deserializeObject(metadata, MetadataJson);

      expect(result.repositoryOfficial).toBe(false);
    });
  });

  describe('stars handling', () => {
    it('should handle zero stars', () => {
      const metadata = {
        Repository: 'user/new-repo',
        OfficialRepository: false,
        RepositoryStars: 0,
        FilePath: 'bucket/app.json',
        Committed: '2024-01-01T00:00:00Z',
        Sha: 'abc',
      };

      const result = jsonConvert.deserializeObject(metadata, MetadataJson);

      expect(result.stars).toBe(0);
    });

    it('should handle large star counts', () => {
      const metadata = {
        Repository: 'popular/repo',
        OfficialRepository: true,
        RepositoryStars: 999999,
        FilePath: 'bucket/app.json',
        Committed: '2024-01-01T00:00:00Z',
        Sha: 'abc',
      };

      const result = jsonConvert.deserializeObject(metadata, MetadataJson);

      expect(result.stars).toBe(999999);
    });
  });
});
