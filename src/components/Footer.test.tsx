import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the footer with creator credits', () => {
    render(<Footer />);

    expect(screen.getByText(/Scoop/i)).toBeInTheDocument();
    expect(screen.getByText(/lukesampson/i)).toBeInTheDocument();
    expect(screen.getByText(/gpailler/i)).toBeInTheDocument();
  });

  it('renders the community link', () => {
    render(<Footer />);

    const communityLink = screen.getByRole('link', { name: /community/i });
    expect(communityLink).toHaveAttribute('href', 'https://github.com/orgs/ScoopInstaller/people');
  });

  it('renders the repository link', () => {
    render(<Footer />);

    const repoLink = screen.getByRole('link', { name: /Website/i });
    expect(repoLink).toHaveAttribute('href', 'https://github.com/ScoopInstaller/scoopinstaller.github.io');
  });

  it('renders version and commit hash', () => {
    render(<Footer />);

    expect(screen.getByText(/\//)).toBeInTheDocument();
  });
});
