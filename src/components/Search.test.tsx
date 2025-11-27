import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type ManifestJson from '../serialization/ManifestJson';
import type SearchResultsJson from '../serialization/SearchResultsJson';
import Search from './Search';
import type SearchBar from './SearchBar';
import type SearchPagination from './SearchPagination';
import type SearchProcessor from './SearchProcessor';
import { SortDirection } from './SearchProcessor';
import type SearchResult from './SearchResult';

const mockSearchBar = vi.fn();
vi.mock('./SearchBar', () => ({
  __esModule: true,
  default: (props: ComponentProps<typeof SearchBar>) => {
    mockSearchBar(props);
    return <div data-testid="search-bar-mock" />;
  },
}));

const mockSearchProcessor = vi.fn();
vi.mock('./SearchProcessor', async () => {
  const actual = await vi.importActual<typeof import('./SearchProcessor')>('./SearchProcessor');
  return {
    __esModule: true,
    SortDirection: actual.SortDirection,
    sortModes: actual.sortModes,
    default: (props: ComponentProps<typeof SearchProcessor>) => {
      mockSearchProcessor(props);
      return <div data-testid="search-processor-mock" />;
    },
  };
});

const mockSearchResult = vi.fn();
vi.mock('./SearchResult', () => ({
  __esModule: true,
  default: (props: ComponentProps<typeof SearchResult>) => {
    mockSearchResult(props);
    const id = props.result?.id ?? 'unknown';
    const context = props.onResultSelected ? 'list' : 'modal';
    return (
      <div data-testid={`search-result-${id}-${context}`} onClick={() => props.onResultSelected?.(props.result)}>
        Result-{id}-{context}
      </div>
    );
  },
}));

const mockSearchPagination = vi.fn();
vi.mock('./SearchPagination', () => ({
  __esModule: true,
  default: (props: ComponentProps<typeof SearchPagination>) => {
    mockSearchPagination(props);
    return <div data-testid="search-pagination-mock" />;
  },
}));

vi.mock('react-bootstrap', () => {
  const MockWrapper = ({ children, ...rest }: { children?: ReactNode } & Record<string, unknown>) => (
    <div {...rest}>{children}</div>
  );
  const Modal = ({ show, children, onHide }: { show?: boolean; children?: ReactNode; onHide?: () => void }) => {
    if (!show) {
      return null;
    }

    return (
      <div data-testid="selected-result-modal">
        <button type="button" data-testid="close-modal" onClick={onHide}>
          Close
        </button>
        {children}
      </div>
    );
  };
  Modal.Body = ({ children }: { children?: ReactNode }) => <div>{children}</div>;

  return {
    Container: MockWrapper,
    Row: MockWrapper,
    Col: MockWrapper,
    Modal,
  };
});

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.search}</div>;
};

const renderSearch = (initialEntries: string[] = ['/']) => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Search />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
};

beforeAll(() => {
  (globalThis as unknown as { cancelIdleCallback: () => void }).cancelIdleCallback = vi.fn();
});

beforeEach(() => {
  mockSearchBar.mockClear();
  mockSearchProcessor.mockClear();
  mockSearchResult.mockClear();
  mockSearchPagination.mockClear();

  (globalThis.fetch as unknown as Mock) = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({ Official: 'main' }),
  });

  (window as unknown as { scrollTo: () => void }).scrollTo = vi.fn();

  localStorage.clear();
});

describe('Search', () => {
  it('initializes state from search params and stored preferences', async () => {
    localStorage.setItem('s', '2');
    localStorage.setItem('d', SortDirection.Ascending.toString());

    renderSearch(['/?q=git&p=3&o=false&dm=false&n=false']);

    await waitFor(() => {
      expect(mockSearchBar).toHaveBeenCalled();
    });

    const barProps = mockSearchBar.mock.calls.at(-1)?.[0];
    expect(barProps.query).toBe('git');

    const processorProps = mockSearchProcessor.mock.calls.at(-1)?.[0];
    expect(processorProps.page).toBe(3);
    expect(processorProps.sortIndex).toBe(2);
    expect(processorProps.sortDirection).toBe(SortDirection.Ascending);
    expect(processorProps.officialOnly).toBe(false);
    expect(processorProps.distinctManifestsOnly).toBe(false);
    expect(processorProps.installBucketName).toBe(false);

    const paginationProps = mockSearchPagination.mock.calls.at(-1)?.[0];
    expect(paginationProps.currentPage).toBe(3);
  });

  it('updates search params and resets the page when the query changes', async () => {
    renderSearch(['/?q=git&p=5']);

    await waitFor(() => {
      expect(mockSearchBar).toHaveBeenCalled();
    });

    let barProps = mockSearchBar.mock.calls.at(-1)?.[0];

    act(() => {
      barProps.onQueryChange('node');
    });

    barProps = mockSearchBar.mock.calls.at(-1)?.[0];

    await waitFor(() => {
      expect(screen.getByTestId('location-display').textContent).toContain('q=node');
      expect(screen.getByTestId('location-display').textContent).toContain('p=1');
    });

    await waitFor(() => {
      const paginationProps = mockSearchPagination.mock.calls.at(-1)?.[0];
      expect(paginationProps.currentPage).toBe(1);
    });

    vi.useFakeTimers();

    act(() => {
      barProps.onSubmit();
      vi.advanceTimersByTime(500);
    });

    vi.useRealTimers();

    await waitFor(() => {
      const processorProps = mockSearchProcessor.mock.calls.at(-1)?.[0];
      expect(processorProps.query).toBe('node');
    });
  });

  it('renders search results and opens the modal when a result is selected', async () => {
    renderSearch();

    await waitFor(() => {
      expect(mockSearchProcessor).toHaveBeenCalled();
    });

    vi.useFakeTimers();

    const processorProps = mockSearchProcessor.mock.calls.at(-1)?.[0];
    const manifest = { id: 'app1' } as ManifestJson;
    const results = {
      count: 1,
      results: [manifest],
    } as SearchResultsJson;

    act(() => {
      processorProps.onResultsChange(results);
      vi.runAllTimers();
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByTestId('search-result-app1-list')).toBeInTheDocument();
    });

    await waitFor(() => {
      const paginationProps = mockSearchPagination.mock.calls.at(-1)?.[0];
      expect(paginationProps.resultsCount).toBe(1);
    });

    act(() => {
      screen.getByTestId('search-result-app1-list').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('selected-result-modal')).toBeInTheDocument();
    });

    expect(screen.getByTestId('location-display').textContent).toContain('id=app1');

    act(() => {
      screen.getByTestId('close-modal').click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('selected-result-modal')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('location-display').textContent).not.toContain('id=');
  });
});
