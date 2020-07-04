import { ManifestJson } from '../serialization/ManifestJson';

export interface ISearchResultProps {
  result: ManifestJson;
}

export interface ISearchResultState {
  copied: boolean;
}
