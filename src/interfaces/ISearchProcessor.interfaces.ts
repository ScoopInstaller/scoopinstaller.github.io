import { SearchResultsJson } from '../serialization/SearchResultsJson';

export interface ISearchProcessorProps {
  page: number;
  query: string;
  sortIndex: number;
  resultsPerPage: number;
  onResultsChange: (value?: SearchResultsJson) => void;
  onSortIndexChange: (sortIndex: number) => void;
}

export interface ISearchProcessorState {
  resultsCount?: number;
  searching: boolean;
}
