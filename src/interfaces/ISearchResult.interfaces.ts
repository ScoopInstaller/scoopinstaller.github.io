import { ManifestJson } from '../serialization/ManifestJson';

export interface ISearchResultProps {
  result: ManifestJson;
  onCopyToClipbard: (content: string) => void;
}
