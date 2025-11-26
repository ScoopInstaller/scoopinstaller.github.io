import { JsonConvert, JsonObject, JsonProperty } from 'json2typescript';

import ManifestJson from './ManifestJson';

@JsonObject('SearchResultsJson')
class SearchResultsJson {
  private static jsonConvert = new JsonConvert();

  static Create(jsonObject: unknown): SearchResultsJson {
    return SearchResultsJson.jsonConvert.deserializeObject(jsonObject as object, SearchResultsJson);
  }

  @JsonProperty('@odata.count', Number)
  count = 0;

  @JsonProperty('value', [ManifestJson])
  results: ManifestJson[] = [] as ManifestJson[];
}

export default SearchResultsJson;
