import { JsonObject, JsonConvert, JsonProperty } from 'json2typescript';
import { BucketsResultsFacetJson } from './BucketsResultsFacetJson';

@JsonObject('BucketsResultsJson')
export class BucketsResultsJson {
  private static jsonConvert = new JsonConvert();

  static Create(jsonObject: any) {
    return BucketsResultsJson.jsonConvert.deserializeObject(
      jsonObject,
      BucketsResultsJson
    );
  }

  @JsonProperty('@odata.count', Number)
  count: number = 0;

  @JsonProperty('@search.facets')
  results: { [key: string]: BucketsResultsFacetJson[] } = {};
}
