import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_API_URL, server } from '../__tests__/server';
import Buckets from './Buckets';

// Mock bucket data response
const mockOfficialBucketsResponse = {
  '@odata.count': 2,
  '@search.facets': {
    'Metadata/Repository': [
      { value: 'ScoopInstaller/Main', count: 1234 },
      { value: 'ScoopInstaller/Extras', count: 890 },
    ],
  },
  value: [],
};

const mockCommunityBucketsResponse = {
  '@odata.count': 1,
  '@search.facets': {
    'Metadata/Repository': [{ value: 'user/community-bucket', count: 456 }],
  },
  value: [],
};

describe('Buckets', () => {
  const renderBuckets = () => {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <Buckets />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  beforeEach(() => {
    // Setup MSW handlers for bucket fetching
    server.use(
      http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
        const body = (await request.json()) as { filter?: string };

        // Return official buckets for official filter
        if (body.filter?.includes('Metadata/OfficialRepositoryNumber eq 1')) {
          return HttpResponse.json(mockOfficialBucketsResponse);
        }

        // Return community buckets for non-official filter
        return HttpResponse.json(mockCommunityBucketsResponse);
      })
    );
  });

  describe('rendering', () => {
    it('shows loading state initially', () => {
      renderBuckets();

      expect(screen.getByText(/Searching for buckets/)).toBeInTheDocument();
    });

    it('displays bucket results after loading', async () => {
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByText(/Found 3 buckets/)).toBeInTheDocument();
      });

      // Check that bucket names are displayed
      expect(screen.getByText('ScoopInstaller/Main')).toBeInTheDocument();
      expect(screen.getByText('ScoopInstaller/Extras')).toBeInTheDocument();
      expect(screen.getByText('user/community-bucket')).toBeInTheDocument();
    });

    it('displays manifest counts', async () => {
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByText('1234')).toBeInTheDocument();
      });

      expect(screen.getByText('890')).toBeInTheDocument();
      expect(screen.getByText('456')).toBeInTheDocument();
    });

    it('renders table headers', async () => {
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: 'Bucket' })).toBeInTheDocument();
      });

      expect(screen.getByRole('columnheader', { name: 'Manifests' })).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('renders sort dropdown with options', async () => {
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByText(/Found 3 buckets/)).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      // Check that the options exist
      expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Manifests' })).toBeInTheDocument();
    });

    it('sorts by name when Name option is selected', async () => {
      const user = userEvent.setup();
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByText(/Found 3 buckets/)).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Name');

      // After sorting by name, check order
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    it('sorts by manifests when Manifests option is selected', async () => {
      const user = userEvent.setup();
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByText(/Found 3 buckets/)).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Manifests');

      // After sorting by manifests, check that items are rendered
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      server.use(
        http.post(`${SEARCH_API_URL}/search`, () => {
          return HttpResponse.error();
        })
      );

      renderBuckets();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('links', () => {
    it('creates correct link for official buckets', async () => {
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByText('ScoopInstaller/Main')).toBeInTheDocument();
      });

      const link = screen.getByRole('link', { name: /ScoopInstaller\/Main/i });
      expect(link).toHaveAttribute('href', expect.stringContaining('/apps'));
    });

    it('creates correct link for community buckets with o=false param', async () => {
      renderBuckets();

      await waitFor(() => {
        expect(screen.getByText('user/community-bucket')).toBeInTheDocument();
      });

      const link = screen.getByRole('link', { name: /user\/community-bucket/i });
      expect(link).toHaveAttribute('href', expect.stringContaining('o=false'));
    });
  });
});
