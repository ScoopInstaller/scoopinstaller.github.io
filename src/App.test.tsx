import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

// Mock child components to simplify testing
vi.mock('./components/Root', () => ({
  default: () => <div data-testid="root">Root Layout</div>,
}));

vi.mock('./components/Home', () => ({
  default: () => <div data-testid="home">Home Page</div>,
}));

vi.mock('./components/Search', () => ({
  default: () => <div data-testid="search">Search Page</div>,
}));

vi.mock('./components/Buckets', () => ({
  default: () => <div data-testid="buckets">Buckets Page</div>,
}));

describe('App', () => {
  it('renders the application with Helmet', () => {
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>
    );

    // The Root component should be rendered
    expect(screen.getByTestId('root')).toBeInTheDocument();
  });
});
