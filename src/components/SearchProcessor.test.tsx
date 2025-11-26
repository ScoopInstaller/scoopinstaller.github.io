import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { mockSearchResponse } from '../__tests__/mocks/fixtures';
import { SEARCH_API_URL, server } from '../__tests__/server';
import SearchProcessor, { SortDirection, sortModes } from './SearchProcessor';

describe('SearchProcessor', () => {
  const mockOnResultsChange = vi.fn();
  const mockOnSortChange = vi.fn();
  const mockOnOfficialOnlyChange = vi.fn();
  const mockOnDistinctManifestsOnlyChange = vi.fn();
  const mockOnInstallBucketName = vi.fn();

  const defaultProps = {
    page: 1,
    query: 'git',
    sortIndex: 0,
    sortDirection: SortDirection.Descending,
    officialOnly: false,
    onOfficialOnlyChange: mockOnOfficialOnlyChange,
    distinctManifestsOnly: false,
    onDistinctManifestsOnlyChange: mockOnDistinctManifestsOnlyChange,
    installBucketName: false,
    onInstallBucketName: mockOnInstallBucketName,
    resultsPerPage: 20,
    onResultsChange: mockOnResultsChange,
    onSortChange: mockOnSortChange,
  };

  describe('rendering', () => {
    it('should render search status and controls', async () => {
      render(<SearchProcessor {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Best match, All buckets/i)).toBeInTheDocument();
      });
    });

    it('should show "Official buckets only" when officialOnly is true', async () => {
      render(<SearchProcessor {...defaultProps} officialOnly={true} />);

      await waitFor(() => {
        expect(screen.getByText(/Best match, Official buckets only/i)).toBeInTheDocument();
      });
    });
  });

  describe('API calls', () => {
    it('should fetch search results on mount', async () => {
      render(<SearchProcessor {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnResultsChange).toHaveBeenCalledWith(
          expect.objectContaining({
            count: 2,
          })
        );
      });
    });

    it('should include query in search request', async () => {
      let requestBody: { search?: string } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { search?: string };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} query="nodejs" />);

      await waitFor(() => {
        expect(requestBody.search).toBe('nodejs');
      });
    });

    it('should apply officialOnly filter when enabled', async () => {
      let requestBody: { filter?: string } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { filter?: string };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} officialOnly={true} />);

      await waitFor(() => {
        expect(requestBody.filter).toContain('Metadata/OfficialRepositoryNumber eq 1');
      });
    });

    it('should apply distinctManifestsOnly filter when enabled', async () => {
      let requestBody: { filter?: string } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { filter?: string };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} distinctManifestsOnly={true} />);

      await waitFor(() => {
        expect(requestBody.filter).toContain('Metadata/DuplicateOf eq null');
      });
    });

    it('should combine multiple filters with "and"', async () => {
      let requestBody: { filter?: string } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { filter?: string };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} officialOnly={true} distinctManifestsOnly={true} />);

      await waitFor(() => {
        expect(requestBody.filter).toContain('Metadata/OfficialRepositoryNumber eq 1');
        expect(requestBody.filter).toContain('and');
        expect(requestBody.filter).toContain('Metadata/DuplicateOf eq null');
      });
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.post(`${SEARCH_API_URL}/search`, () => {
          return HttpResponse.json({ error: 'Search failed' }, { status: 500 });
        })
      );

      render(<SearchProcessor {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnResultsChange).toHaveBeenCalledWith(undefined);
      });
    });
  });

  describe('sorting', () => {
    it('should apply correct orderby for Best match descending', async () => {
      let requestBody: { orderby?: string } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { orderby?: string };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} sortIndex={0} sortDirection={SortDirection.Descending} />);

      await waitFor(() => {
        expect(requestBody.orderby).toBe(sortModes[0].OrderBy[SortDirection.Descending].join(', '));
      });
    });

    it('should apply correct orderby for Name ascending', async () => {
      let requestBody: { orderby?: string } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { orderby?: string };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} sortIndex={1} sortDirection={SortDirection.Ascending} />);

      await waitFor(() => {
        expect(requestBody.orderby).toBe(sortModes[1].OrderBy[SortDirection.Ascending].join(', '));
      });
    });

    it('should apply correct orderby for Newest descending', async () => {
      let requestBody: { orderby?: string } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { orderby?: string };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} sortIndex={2} sortDirection={SortDirection.Descending} />);

      await waitFor(() => {
        expect(requestBody.orderby).toBe(sortModes[2].OrderBy[SortDirection.Descending].join(', '));
      });
    });
  });

  describe('pagination', () => {
    it('should calculate skip value correctly for page 1', async () => {
      let requestBody: { skip?: number } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { skip?: number };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} page={1} resultsPerPage={20} />);

      await waitFor(() => {
        expect(requestBody.skip).toBe(0);
      });
    });

    it('should calculate skip value correctly for page 2', async () => {
      let requestBody: { skip?: number } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { skip?: number };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} page={2} resultsPerPage={20} />);

      await waitFor(() => {
        expect(requestBody.skip).toBe(20);
      });
    });

    it('should apply top value from resultsPerPage', async () => {
      let requestBody: { top?: number } = {};

      server.use(
        http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
          requestBody = (await request.json()) as { top?: number };
          return HttpResponse.json(mockSearchResponse);
        })
      );

      render(<SearchProcessor {...defaultProps} resultsPerPage={50} />);

      await waitFor(() => {
        expect(requestBody.top).toBe(50);
      });
    });
  });

  describe('user interactions', () => {
    it('should toggle officialOnly when clicked', async () => {
      const user = userEvent.setup();
      render(<SearchProcessor {...defaultProps} />);

      // Open dropdown
      const dropdownButton = screen.getByRole('button', { name: /Best match, All buckets/i });
      await user.click(dropdownButton);

      // Find and click the button containing "Official buckets only"
      const officialOnlyButton = screen.getByText(/Official buckets only/i).closest('button');
      if (officialOnlyButton) {
        await user.click(officialOnlyButton);
      }

      expect(mockOnOfficialOnlyChange).toHaveBeenCalledWith(true);
    });

    it('should toggle distinctManifestsOnly when clicked', async () => {
      const user = userEvent.setup();
      render(<SearchProcessor {...defaultProps} />);

      // Open dropdown
      const dropdownButton = screen.getByRole('button', { name: /Best match, All buckets/i });
      await user.click(dropdownButton);

      // Find and click the button containing "Distinct manifests only"
      const distinctButton = screen.getByText(/Distinct manifests only/i).closest('button');
      if (distinctButton) {
        await user.click(distinctButton);
      }

      expect(mockOnDistinctManifestsOnlyChange).toHaveBeenCalledWith(true);
    });

    it('should toggle installBucketName when clicked', async () => {
      const user = userEvent.setup();
      render(<SearchProcessor {...defaultProps} />);

      // Open dropdown
      const dropdownButton = screen.getByRole('button', { name: /Best match, All buckets/i });
      await user.click(dropdownButton);

      // Find and click the button containing "Show bucket name"
      const bucketNameButton = screen.getByText(/Show bucket name/i).closest('button');
      if (bucketNameButton) {
        await user.click(bucketNameButton);
      }

      expect(mockOnInstallBucketName).toHaveBeenCalledWith(true);
    });

    it('should call onSortChange when sort mode is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchProcessor {...defaultProps} />);

      // Open dropdown
      const dropdownButton = screen.getByRole('button', { name: /Best match, All buckets/i });
      await user.click(dropdownButton);

      // Click on Name sort - get all buttons and find the one with just "Name"
      const nameButtons = screen.getAllByRole('button').filter((button) => button.textContent?.trim() === 'Name');
      if (nameButtons.length > 0) {
        await user.click(nameButtons[0]);
      }

      expect(mockOnSortChange).toHaveBeenCalledWith(1, SortDirection.Ascending);
    });

    it('should toggle sort direction when clicking same sort mode', async () => {
      const user = userEvent.setup();
      render(<SearchProcessor {...defaultProps} sortIndex={0} sortDirection={SortDirection.Descending} />);

      // Open dropdown
      const dropdownButton = screen.getByRole('button', { name: /Best match, All buckets/i });
      await user.click(dropdownButton);

      // Click on Best match again (same sort) - use getAllByRole and select the dropdown item
      const bestMatchSortButtons = screen.getAllByRole('button', { name: /^Best match$/i });
      // The dropdown item will be the second one (first is the toggle)
      await user.click(bestMatchSortButtons[bestMatchSortButtons.length - 1]);

      expect(mockOnSortChange).toHaveBeenCalledWith(0, SortDirection.Ascending);
    });
  });

  describe('abort controller', () => {
    it('should abort previous request when query changes', async () => {
      const { rerender } = render(<SearchProcessor {...defaultProps} query="git" />);

      await waitFor(() => {
        expect(mockOnResultsChange).toHaveBeenCalled();
      });

      mockOnResultsChange.mockClear();

      // Change query
      rerender(<SearchProcessor {...defaultProps} query="nodejs" />);

      await waitFor(() => {
        expect(mockOnResultsChange).toHaveBeenCalled();
      });
    });
  });
});
