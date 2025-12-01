/**
 * Mock data fixtures for tests
 */

// Mock Azure Search API response for app search
export const mockSearchResponse = {
  '@odata.count': 2,
  value: [
    {
      Id: 'main/git',
      '@search.score': 10.5,
      Name: 'git',
      NamePartial: 'git',
      NameSuffix: 'git',
      Description: 'Distributed version control system',
      Notes: '',
      Homepage: 'https://gitforwindows.org',
      License: 'GPL-2.0-only',
      Version: '2.43.0',
      Metadata: {
        Repository: 'ScoopInstaller/Main',
        OfficialRepository: true,
        RepositoryStars: 5000,
        BranchName: 'master',
        FilePath: 'bucket/git.json',
        Committed: '2024-01-15T10:30:00Z',
        Sha: 'abc123def456',
      },
      '@search.highlights': {
        Name: ['<em>git</em>'],
        Description: ['Distributed version control system'],
      },
    },
    {
      Id: 'extras/github',
      '@search.score': 8.2,
      Name: 'github',
      NamePartial: 'github',
      NameSuffix: 'github',
      Description: 'GitHub Desktop application',
      Homepage: 'https://desktop.github.com',
      License: 'MIT',
      Version: '3.3.6',
      Metadata: {
        Repository: 'ScoopInstaller/Extras',
        OfficialRepository: true,
        RepositoryStars: 3500,
        BranchName: 'master',
        FilePath: 'bucket/github.json',
        Committed: '2024-01-10T14:20:00Z',
        Sha: 'def789ghi012',
      },
      '@search.highlights': {
        Name: ['<em>git</em>hub'],
      },
    },
  ],
};

// Empty search response
export const mockEmptySearchResponse = {
  '@odata.count': 0,
  value: [],
};

// Mock single manifest
export const mockManifest = {
  Id: 'main/nodejs',
  '@search.score': 12.0,
  Name: 'nodejs',
  NamePartial: 'nodejs',
  NameSuffix: 'nodejs',
  Description: 'JavaScript runtime environment',
  Notes: 'LTS version recommended for most users',
  Homepage: 'https://nodejs.org',
  License: 'MIT',
  Version: '20.11.0',
  Metadata: {
    Repository: 'ScoopInstaller/Main',
    OfficialRepository: true,
    RepositoryStars: 5000,
    BranchName: 'master',
    FilePath: 'bucket/nodejs.json',
    Committed: '2024-01-20T08:15:00Z',
    Sha: 'xyz789abc123',
  },
};

// Mock buckets response
export const mockBucketsResponse = {
  '@odata.count': 3,
  '@search.facets': {
    'Metadata/OfficialRepository': [
      { value: true, count: 2 },
      { value: false, count: 1 },
    ],
  },
  value: [
    {
      Repository: 'ScoopInstaller/Main',
      OfficialRepository: true,
      RepositoryStars: 5000,
      ManifestCount: 1234,
    },
    {
      Repository: 'ScoopInstaller/Extras',
      OfficialRepository: true,
      RepositoryStars: 3500,
      ManifestCount: 890,
    },
    {
      Repository: 'lukesampson/scoop-extras',
      OfficialRepository: false,
      RepositoryStars: 1200,
      ManifestCount: 456,
    },
  ],
};

// Mock GitHub buckets.json response
export const mockGitHubBucketsJson = [
  {
    name: 'main',
    repository: 'https://github.com/ScoopInstaller/Main',
    official: true,
  },
  {
    name: 'extras',
    repository: 'https://github.com/ScoopInstaller/Extras',
    official: true,
  },
];

// Mock error response
export const mockErrorResponse = {
  error: {
    code: 'ServiceUnavailable',
    message: 'The search service is temporarily unavailable',
  },
};

// Helper to create a mock manifest with custom properties
export function createMockManifest(overrides: Partial<typeof mockManifest> = {}) {
  return {
    ...mockManifest,
    ...overrides,
    Metadata: {
      ...mockManifest.Metadata,
      ...(overrides.Metadata || {}),
    },
  };
}

// Helper to create a mock search response with custom results
export function createMockSearchResponse(results: unknown[] = [], count?: number) {
  return {
    '@odata.count': count ?? results.length,
    value: results,
  };
}
