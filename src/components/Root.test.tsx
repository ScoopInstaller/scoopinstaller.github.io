import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Root from './Root';

// Mock child components to simplify testing
vi.mock('./NavBar', () => ({
  default: () => <div data-testid="navbar">NavBar</div>,
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../colorscheme/ColorSchemeProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="color-scheme-provider">{children}</div>,
}));

describe('Root', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders NavBar component', () => {
    render(
      <MemoryRouter>
        <Root />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders Footer component', () => {
    render(
      <MemoryRouter>
        <Root />
      </MemoryRouter>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('wraps content with ColorSchemeProvider', () => {
    render(
      <MemoryRouter>
        <Root />
      </MemoryRouter>
    );

    expect(screen.getByTestId('color-scheme-provider')).toBeInTheDocument();
  });
});
