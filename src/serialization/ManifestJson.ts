import { JsonObject, JsonProperty, Any } from 'json2typescript';

import MetadataJson from './MetadataJson';

type HighLight = string | undefined;

type HighLights = { [propertyName: string]: string } | undefined;

@JsonObject('ManifestJson')
class ManifestJson {
  @JsonProperty('Id', String)
  id = '';

  @JsonProperty('@search.score', Number)
  score = 0;

  @JsonProperty('Name', String)
  name = '';

  @JsonProperty('NamePartial', String)
  namePartial = '';

  @JsonProperty('NameSuffix', String)
  nameSuffix = '';

  @JsonProperty('Description', String, true)
  description?: string = undefined;

  @JsonProperty('Homepage', String, true)
  homepage?: string = undefined;

  @JsonProperty('License', String, true)
  license?: string = undefined;

  @JsonProperty('Version', String, true)
  version = '';

  @JsonProperty('Metadata', MetadataJson)
  metadata: MetadataJson = new MetadataJson();

  @JsonProperty('@search.highlights', Any, true)
  private highlights: HighLights = undefined;

  get highlightedName(): HighLight {
    return this.tryGetHighlights(['NamePartial', 'Name', 'NameSuffix'], this.name);
  }

  get highlightedLicense(): HighLight {
    return this.tryGetHighlight('License', this.license);
  }

  get highlightedRepository(): HighLight {
    return this.tryGetHighlight('Metadata/Repository', this.metadata.repository);
  }

  get highlightedAuthorName(): HighLight {
    return this.tryGetHighlight('Metadata/AuthorName', this.metadata.authorName);
  }

  get highlightedDescription(): HighLight {
    return this.tryGetHighlight('Description', this.description);
  }

  get highlightedVersion(): HighLight {
    return this.tryGetHighlight('Version', this.version.length ? this.version : 'Unknown');
  }

  get favicon(): HighLight {
    if (this.homepage) {
      const parser = document.createElement('a');
      parser.href = this.homepage;

      return `${parser.origin}/favicon.ico`;
    }

    return undefined;
  }

  tryGetHighlight(propertyName: string, fallback?: string): HighLight {
    return this.tryGetHighlights([propertyName], fallback);
  }

  tryGetHighlights(propertyNames: string[], fallback?: string): HighLight {
    const match = propertyNames.find((value: string) => {
      return this.highlights && this.highlights[value];
    });

    return match && this.highlights ? this.highlights[match] : fallback;
  }
}

export default ManifestJson;
