import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { MetadataJson } from './MetadataJson';

@JsonObject('ManifestJson')
export class ManifestJson {
  @JsonProperty('Id', String)
  id: string = '';

  @JsonProperty('@search.score', Number)
  score: number = 0;

  @JsonProperty('Name', String)
  name: string = '';

  @JsonProperty('Description', String, true)
  description?: string = undefined;

  @JsonProperty('Homepage', String, true)
  homepage?: string = undefined;

  @JsonProperty('License', String, true)
  license?: string = undefined;

  @JsonProperty('Version', String, true)
  version: string = '';

  @JsonProperty('Metadata', MetadataJson)
  metadata: MetadataJson = new MetadataJson();

  @JsonProperty('@search.highlights', Any, true)
  private _highlights: any = undefined;

  get highlightedName() {
    return this.tryGetHighlight('Name', this.name);
  }

  get highlightedLicense() {
    return this.tryGetHighlight('License', this.license);
  }

  get highlightedRepository() {
    return this.tryGetHighlight(
      'Metadata/Repository',
      this.metadata.repository.replace('https://github.com/', '')
    );
  }

  get highlightedAuthorName() {
    return this.tryGetHighlight(
      'Metadata/AuthorName',
      this.metadata.authorName
    );
  }

  get highlightedDescription() {
    return this.tryGetHighlight('Description', this.description);
  }

  get highlightedVersion() {
    return this.tryGetHighlight('Version', this.version);
  }

  tryGetHighlight(propertyName: string, fallback?: string) {
    return this._highlights && this._highlights[propertyName]
      ? this._highlights[propertyName][0]
      : fallback;
  }

  get favicon() {
    if (this.homepage) {
      var parser = document.createElement('a');
      parser.href = this.homepage;

      return parser.origin + '/favicon.ico';
    }

    return undefined;
  }
}
