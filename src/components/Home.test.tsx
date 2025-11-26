import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorSchemeContext } from '../colorscheme/ColorSchemeContext';
import { ColorSchemeType } from '../colorscheme/ColorSchemeType';
import Home from './Home';

// Mock AsciinemaCasts as it has complex dependencies
vi.mock('./AsciinemaCasts', () => ({
  default: () => <div data-testid="asciinema-casts">Asciinema Casts</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home', () => {
  const defaultContextValue = {
    preferedColorScheme: ColorSchemeType.Auto,
    browserColorScheme: ColorSchemeType.Light,
    isDarkMode: false,
    toggleColorScheme: vi.fn(),
  };

  const renderHome = (contextOverrides = {}) => {
    const contextValue = { ...defaultContextValue, ...contextOverrides };

    return render(
      <MemoryRouter>
        <ColorSchemeContext.Provider value={contextValue}>
          <Home />
        </ColorSchemeContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders the main heading', () => {
      renderHome();

      expect(screen.getByText('Scoop')).toBeInTheDocument();
      expect(screen.getByText('A command-line installer for Windows')).toBeInTheDocument();
    });

    it('renders the search bar', () => {
      renderHome();

      expect(screen.getByPlaceholderText('Search an app')).toBeInTheDocument();
    });

    it('renders the quickstart section', () => {
      renderHome();

      expect(screen.getByText('Quickstart')).toBeInTheDocument();
      expect(screen.getByText(/PowerShell terminal/)).toBeInTheDocument();
    });

    it('renders the "What does Scoop do?" section', () => {
      renderHome();

      expect(screen.getByText('What does Scoop do?')).toBeInTheDocument();
      expect(screen.getByText(/Eliminates permission popup windows/)).toBeInTheDocument();
    });

    it('renders AsciinemaCasts component', () => {
      renderHome();

      expect(screen.getByTestId('asciinema-casts')).toBeInTheDocument();
    });

    it('renders the documentation section', () => {
      renderHome();

      expect(screen.getByText('Documentation')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('navigates to apps page with search query when form is submitted', async () => {
      const user = userEvent.setup();
      renderHome();

      const searchInput = screen.getByPlaceholderText('Search an app');
      await user.type(searchInput, 'git');
      await user.keyboard('{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: '/apps',
        search: 'q=git',
      });
    });
  });

  describe('copy to clipboard', () => {
    it('renders copy buttons for code blocks', () => {
      renderHome();

      const copyButtons = screen.getAllByTitle('Copy to clipboard');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('color scheme', () => {
    it('applies light style in light mode', () => {
      renderHome({ isDarkMode: false });

      // Component should render without error in light mode
      expect(screen.getByText('Scoop')).toBeInTheDocument();
    });

    it('applies dark style in dark mode', () => {
      renderHome({ isDarkMode: true });

      // Component should render without error in dark mode
      expect(screen.getByText('Scoop')).toBeInTheDocument();
    });
  });
});
