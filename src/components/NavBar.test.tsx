import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorSchemeContext } from '../colorscheme/ColorSchemeContext';
import { ColorSchemeType } from '../colorscheme/ColorSchemeType';
import NavBar from './NavBar';

describe('NavBar', () => {
  const mockToggleColorScheme = vi.fn();

  const defaultContextValue = {
    preferedColorScheme: ColorSchemeType.Auto,
    browserColorScheme: ColorSchemeType.Light,
    isDarkMode: false,
    toggleColorScheme: mockToggleColorScheme,
  };

  const renderNavBar = (contextOverrides = {}) => {
    const contextValue = { ...defaultContextValue, ...contextOverrides };

    return render(
      <MemoryRouter>
        <ColorSchemeContext.Provider value={contextValue}>
          <NavBar />
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
    it('renders the Scoop brand link', () => {
      renderNavBar();

      expect(screen.getByText('Scoop')).toBeInTheDocument();
    });

    it('renders the Apps navigation link', () => {
      renderNavBar();

      expect(screen.getByText('Apps')).toBeInTheDocument();
    });

    it('renders the Buckets navigation link', () => {
      renderNavBar();

      expect(screen.getByText('Buckets')).toBeInTheDocument();
    });
  });

  describe('color scheme toggle', () => {
    it('renders icon for auto mode with light browser preference', () => {
      const { container } = renderNavBar({
        preferedColorScheme: ColorSchemeType.Auto,
        browserColorScheme: ColorSchemeType.Light,
      });

      const button = container.querySelector('button.btn-secondary');
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Check for the title element inside the SVG
      expect(svg?.querySelector('title')).toHaveTextContent('Auto mode. Click to switch to dark mode');
    });

    it('renders icon for auto mode with dark browser preference', () => {
      const { container } = renderNavBar({
        preferedColorScheme: ColorSchemeType.Auto,
        browserColorScheme: ColorSchemeType.Dark,
      });

      const button = container.querySelector('button.btn-secondary');
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('title')).toHaveTextContent('Auto mode. Click to switch to light mode');
    });

    it('renders icon for light mode with light browser preference', () => {
      const { container } = renderNavBar({
        preferedColorScheme: ColorSchemeType.Light,
        browserColorScheme: ColorSchemeType.Light,
      });

      const button = container.querySelector('button.btn-secondary');
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('title')).toHaveTextContent('Light mode. Click to switch to OS/browser preferred mode');
    });

    it('renders icon for light mode with dark browser preference', () => {
      const { container } = renderNavBar({
        preferedColorScheme: ColorSchemeType.Light,
        browserColorScheme: ColorSchemeType.Dark,
      });

      const button = container.querySelector('button.btn-secondary');
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('title')).toHaveTextContent('Light mode. Click to switch to dark mode');
    });

    it('renders icon for dark mode with light browser preference', () => {
      const { container } = renderNavBar({
        preferedColorScheme: ColorSchemeType.Dark,
        browserColorScheme: ColorSchemeType.Light,
      });

      const button = container.querySelector('button.btn-secondary');
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('title')).toHaveTextContent('Dark mode. Click to switch to light mode');
    });

    it('renders icon for dark mode with dark browser preference', () => {
      const { container } = renderNavBar({
        preferedColorScheme: ColorSchemeType.Dark,
        browserColorScheme: ColorSchemeType.Dark,
      });

      const button = container.querySelector('button.btn-secondary');
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('title')).toHaveTextContent('Dark mode. Click to switch to OS/browser preferred mode');
    });

    it('calls toggleColorScheme when theme button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderNavBar();

      const themeButton = container.querySelector('button.btn-secondary');
      expect(themeButton).toBeInTheDocument();
      if (themeButton) {
        await user.click(themeButton);
      }

      expect(mockToggleColorScheme).toHaveBeenCalledTimes(1);
    });
  });
});
