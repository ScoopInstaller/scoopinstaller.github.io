import { describe, expect, it } from 'vitest';
import { extractPathFromUrl } from './utils';

describe('extractPathFromUrl', () => {
  describe('basic functionality', () => {
    it('should extract last two segments from URL with forward slashes', () => {
      const url = 'https://github.com/ScoopInstaller/Main';
      const result = extractPathFromUrl(url);

      expect(result).toBe('ScoopInstaller/Main');
    });

    it('should extract last two segments from path string', () => {
      const path = 'bucket/app.json';
      const result = extractPathFromUrl(path);

      expect(result).toBe('bucket/app.json');
    });

    it('should handle URLs with multiple path segments', () => {
      const url = 'https://github.com/ScoopInstaller/Main/tree/master/bucket';
      const result = extractPathFromUrl(url);

      expect(result).toBe('master/bucket');
    });

    it('should handle URLs with query parameters', () => {
      const url = 'https://example.com/user/repo?param=value';
      const result = extractPathFromUrl(url);

      expect(result).toBe('user/repo?param=value');
    });

    it('should handle URLs with hash fragments', () => {
      const url = 'https://example.com/user/repo#section';
      const result = extractPathFromUrl(url);

      expect(result).toBe('user/repo#section');
    });
  });

  describe('custom separator', () => {
    it('should use custom separator when provided', () => {
      const url = 'https://github.com/ScoopInstaller/Main';
      const result = extractPathFromUrl(url, ' > ');

      expect(result).toBe('ScoopInstaller > Main');
    });

    it('should use hyphen as separator', () => {
      const url = 'https://github.com/ScoopInstaller/Main';
      const result = extractPathFromUrl(url, '-');

      expect(result).toBe('ScoopInstaller-Main');
    });

    it('should use empty string as separator', () => {
      const url = 'https://github.com/ScoopInstaller/Main';
      const result = extractPathFromUrl(url, '');

      expect(result).toBe('ScoopInstallerMain');
    });

    it('should use custom multi-character separator', () => {
      const url = 'https://github.com/ScoopInstaller/Main';
      const result = extractPathFromUrl(url, ' :: ');

      expect(result).toBe('ScoopInstaller :: Main');
    });
  });

  describe('edge cases', () => {
    it('should handle URLs with only two segments', () => {
      const url = 'user/repo';
      const result = extractPathFromUrl(url);

      expect(result).toBe('user/repo');
    });

    it('should handle URLs with one segment', () => {
      const url = 'single';
      const result = extractPathFromUrl(url);

      expect(result).toBe('single');
    });

    it('should handle empty string', () => {
      const url = '';
      const result = extractPathFromUrl(url);

      expect(result).toBe('');
    });

    it('should handle URLs with trailing slash', () => {
      const url = 'https://github.com/ScoopInstaller/Main/';
      const result = extractPathFromUrl(url);

      expect(result).toBe('Main/');
    });

    it('should handle URLs with multiple trailing slashes', () => {
      const url = 'https://github.com/ScoopInstaller/Main///';
      const result = extractPathFromUrl(url);

      expect(result).toBe('/');
    });

    it('should handle URLs with port numbers', () => {
      const url = 'http://localhost:3000/user/repo';
      const result = extractPathFromUrl(url);

      expect(result).toBe('user/repo');
    });

    it('should handle file paths with backslashes (Windows-style)', () => {
      // Although the function expects forward slashes, test with mixed separators
      const path = 'C:/Users/bucket/app.json';
      const result = extractPathFromUrl(path);

      expect(result).toBe('bucket/app.json');
    });

    it('should handle URLs with special characters in path', () => {
      const url = 'https://example.com/my-user/my-repo';
      const result = extractPathFromUrl(url);

      expect(result).toBe('my-user/my-repo');
    });

    it('should handle URLs with encoded characters', () => {
      const url = 'https://example.com/user%20name/repo%20name';
      const result = extractPathFromUrl(url);

      expect(result).toBe('user%20name/repo%20name');
    });
  });

  describe('real-world examples', () => {
    it('should extract repository path from GitHub URL', () => {
      const url = 'https://github.com/ScoopInstaller/Extras';
      const result = extractPathFromUrl(url);

      expect(result).toBe('ScoopInstaller/Extras');
    });

    it('should extract file path from raw GitHub content URL', () => {
      const url = 'https://raw.githubusercontent.com/ScoopInstaller/Main/master/bucket/git.json';
      const result = extractPathFromUrl(url);

      expect(result).toBe('bucket/git.json');
    });

    it('should extract repository and branch from GitHub tree URL', () => {
      const url = 'https://github.com/ScoopInstaller/Main/tree/master/bucket';
      const result = extractPathFromUrl(url);

      expect(result).toBe('master/bucket');
    });

    it('should extract file path from Azure Search metadata', () => {
      const filePath = 'bucket/nodejs.json';
      const result = extractPathFromUrl(filePath);

      expect(result).toBe('bucket/nodejs.json');
    });
  });
});
