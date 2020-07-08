import { SearchResultsJson } from '../serialization/SearchResultsJson';

export interface IAppState {
  query: string;
  currentPage: number;
  sortIndex: number;
  searchResults?: SearchResultsJson;
  contentToCopy?: string;
}
