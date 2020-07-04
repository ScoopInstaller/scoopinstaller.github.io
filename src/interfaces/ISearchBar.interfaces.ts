export interface ISearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export interface ISearchBarState {
  query: string;
}
