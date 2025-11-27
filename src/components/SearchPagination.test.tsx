import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchPagination from './SearchPagination';

describe('SearchPagination', () => {
  const defaultProps = {
    resultsPerPage: 10,
    onPageChange: vi.fn(),
  };

  describe('visibility', () => {
    it('returns null when only a single page exists', () => {
      const { container } = render(
        <SearchPagination {...defaultProps} currentPage={1} resultsCount={10} onPageChange={vi.fn()} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('returns null when resultsCount is 0', () => {
      const { container } = render(
        <SearchPagination {...defaultProps} currentPage={1} resultsCount={0} onPageChange={vi.fn()} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders pagination when multiple pages exist', () => {
      render(<SearchPagination {...defaultProps} currentPage={1} resultsCount={25} onPageChange={vi.fn()} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('page clamping', () => {
    it('clamps the active page to the last page when currentPage exceeds total pages', () => {
      const onPageChange = vi.fn();

      render(<SearchPagination {...defaultProps} currentPage={5} resultsCount={30} onPageChange={onPageChange} />);

      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('clamps to first page when navigating before page 1', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(<SearchPagination {...defaultProps} currentPage={1} resultsCount={50} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('clamps to last page when navigating past the end', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(<SearchPagination {...defaultProps} currentPage={5} resultsCount={50} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageChange).toHaveBeenCalledWith(5);
    });
  });

  describe('navigation', () => {
    it('renders pagination controls and handles navigation clicks', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(<SearchPagination {...defaultProps} currentPage={3} resultsCount={50} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageChange).toHaveBeenCalledWith(2);

      await user.click(screen.getByRole('button', { name: '1' }));
      expect(onPageChange).toHaveBeenCalledWith(1);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('navigates to specific page when clicking page number', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(<SearchPagination {...defaultProps} currentPage={1} resultsCount={50} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: '3' }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('navigates to last page when clicking last page number', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(<SearchPagination {...defaultProps} currentPage={1} resultsCount={50} onPageChange={onPageChange} />);

      await user.click(screen.getByRole('button', { name: '5' }));
      expect(onPageChange).toHaveBeenCalledWith(5);
    });
  });

  describe('active page highlighting', () => {
    it('highlights the first page when currentPage is 1', () => {
      render(<SearchPagination {...defaultProps} currentPage={1} resultsCount={50} onPageChange={vi.fn()} />);

      const firstPageButton = screen.getByText('1').closest('li');
      expect(firstPageButton).toHaveClass('active');
    });

    it('highlights the last page when currentPage equals total pages', () => {
      render(<SearchPagination {...defaultProps} currentPage={5} resultsCount={50} onPageChange={vi.fn()} />);

      const lastPageButton = screen.getByText('5').closest('li');
      expect(lastPageButton).toHaveClass('active');
    });

    it('highlights middle page correctly', () => {
      render(<SearchPagination {...defaultProps} currentPage={3} resultsCount={50} onPageChange={vi.fn()} />);

      const middlePageButton = screen.getByText('3').closest('li');
      expect(middlePageButton).toHaveClass('active');
    });
  });

  describe('ellipsis rendering', () => {
    it('shows ellipsis for large page counts when on first page', () => {
      render(<SearchPagination {...defaultProps} currentPage={1} resultsCount={200} onPageChange={vi.fn()} />);

      // With 20 pages and currentPage=1, we should see ellipsis before the last page
      const ellipsis = screen.queryAllByText('…');
      expect(ellipsis.length).toBe(1);
    });

    it('shows ellipsis for large page counts when on last page', () => {
      render(<SearchPagination {...defaultProps} currentPage={20} resultsCount={200} onPageChange={vi.fn()} />);

      // With 20 pages and currentPage=20, we should see ellipsis after the first page
      const ellipsis = screen.queryAllByText('…');
      expect(ellipsis.length).toBe(1);
    });

    it('shows ellipsis on both sides when in the middle of many pages', () => {
      render(<SearchPagination {...defaultProps} currentPage={10} resultsCount={200} onPageChange={vi.fn()} />);

      // With 20 pages and currentPage=10, we should see ellipsis on both sides
      const ellipsis = screen.queryAllByText('…');
      expect(ellipsis.length).toBe(2);
    });
  });

  describe('page range calculation', () => {
    it('shows correct page range for first page with many pages', () => {
      render(<SearchPagination {...defaultProps} currentPage={1} resultsCount={100} onPageChange={vi.fn()} />);

      // First page should always be visible (active, so it's a span)
      expect(screen.getByText('1').closest('li')).toHaveClass('active');
      // Last page (10) should always be visible as a button
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('shows correct page range for last page with many pages', () => {
      render(<SearchPagination {...defaultProps} currentPage={10} resultsCount={100} onPageChange={vi.fn()} />);

      // First page should always be visible as a button
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      // Last page should be active (rendered as span)
      expect(screen.getByText('10').closest('li')).toHaveClass('active');
    });

    it('shows correct page range for middle page', () => {
      render(<SearchPagination {...defaultProps} currentPage={5} resultsCount={100} onPageChange={vi.fn()} />);

      // First and last pages should be visible as buttons
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
      // Current page should be visible and active
      expect(screen.getByText('5').closest('li')).toHaveClass('active');
    });
  });
});
