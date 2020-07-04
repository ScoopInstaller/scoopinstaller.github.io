export interface ISearchPaginationProps {
  currentPage: number;
  resultsCount?: number;
  resultsPerPage: number;
  onPageChange: (newPage: number) => void;
}
