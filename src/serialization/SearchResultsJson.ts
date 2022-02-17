import { JsonObject, JsonConvert, JsonProperty } from 'json2typescript';

import ManifestJson from './ManifestJson';

@JsonObject('SearchResultsJson')
class SearchResultsJson {
  private static jsonConvert = new JsonConvert();

  static Create(jsonObject: unknown): SearchResultsJson {
    return SearchResultsJson.jsonConvert.deserializeObject(jsonObject, SearchResultsJson);
  }

  @JsonProperty('@odata.count', Number)
  count = 0;

  @JsonProperty('value', [ManifestJson])
  results: ManifestJson[] = Array<ManifestJson>();
}

export default SearchResultsJson;
