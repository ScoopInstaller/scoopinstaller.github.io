import { JsonObject, JsonConvert, JsonProperty } from 'json2typescript';
import { ManifestJson } from './ManifestJson';

@JsonObject('SearchResultsJson')
export class SearchResultsJson {
  private static jsonConvert = new JsonConvert();

  static Create(jsonObject: any) {
    return SearchResultsJson.jsonConvert.deserializeObject(
      jsonObject,
      SearchResultsJson
    );
  }

  @JsonProperty('@odata.count', Number)
  count: number = 0;

  @JsonProperty('value', [ManifestJson])
  results: ManifestJson[] = Array<ManifestJson>();
}
