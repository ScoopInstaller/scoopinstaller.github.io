import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SearchStatus, { SearchStatusType } from './SearchStatus';

describe('SearchStatus', () => {
  describe('searching state', () => {
    it('shows searching message with spinner for applications', () => {
      const { container } = render(
        <SearchStatus searching={true} resultsCount={0} type={SearchStatusType.Applications} />
      );

      expect(screen.getByText('Searching for applications...')).toBeInTheDocument();
      // Check for the spinner element by class
      expect(container.querySelector('.spinner-border')).toBeInTheDocument();
    });

    it('shows searching message with spinner for buckets', () => {
      render(<SearchStatus searching={true} resultsCount={0} type={SearchStatusType.Buckets} />);

      expect(screen.getByText('Searching for buckets...')).toBeInTheDocument();
    });
  });

  describe('results state', () => {
    it('shows results count without query', () => {
      render(<SearchStatus searching={false} resultsCount={42} type={SearchStatusType.Applications} />);

      expect(screen.getByText(/Found 42 applications/)).toBeInTheDocument();
    });

    it('shows results count with query', () => {
      render(<SearchStatus searching={false} resultsCount={10} query="git" type={SearchStatusType.Applications} />);

      expect(screen.getByText(/Found 10 applications/)).toBeInTheDocument();
      expect(screen.getByText('git')).toBeInTheDocument();
    });

    it('shows results count for buckets', () => {
      render(<SearchStatus searching={false} resultsCount={5} type={SearchStatusType.Buckets} />);

      expect(screen.getByText(/Found 5 buckets/)).toBeInTheDocument();
    });
  });

  describe('no results state', () => {
    it('shows no results message without query', () => {
      render(<SearchStatus searching={false} resultsCount={0} type={SearchStatusType.Applications} />);

      expect(screen.getByText('No result found.')).toBeInTheDocument();
    });

    it('shows no results message with query', () => {
      render(
        <SearchStatus searching={false} resultsCount={0} query="nonexistent" type={SearchStatusType.Applications} />
      );

      expect(screen.getByText(/No result found/)).toBeInTheDocument();
      expect(screen.getByText('nonexistent')).toBeInTheDocument();
    });

    it('shows official buckets hint when officialOnly is true', () => {
      render(
        <SearchStatus
          searching={false}
          resultsCount={0}
          query="test"
          type={SearchStatusType.Applications}
          officialOnly={true}
        />
      );

      expect(screen.getByText(/Official buckets/)).toBeInTheDocument();
      expect(screen.getByText(/Try modifying the filters/)).toBeInTheDocument();
    });

    it('does not show official buckets hint when officialOnly is false', () => {
      render(
        <SearchStatus
          searching={false}
          resultsCount={0}
          query="test"
          type={SearchStatusType.Applications}
          officialOnly={false}
        />
      );

      expect(screen.queryByText(/Official buckets/)).not.toBeInTheDocument();
      expect(screen.getByText(/No result found/)).toBeInTheDocument();
    });
  });

  describe('query formatting', () => {
    it('handles empty query string', () => {
      render(<SearchStatus searching={false} resultsCount={10} query="" type={SearchStatusType.Applications} />);

      expect(screen.getByText(/Found 10 applications/)).toBeInTheDocument();
    });

    it('handles undefined query', () => {
      render(<SearchStatus searching={false} resultsCount={10} type={SearchStatusType.Applications} />);

      expect(screen.getByText(/Found 10 applications/)).toBeInTheDocument();
    });
  });
});
