import { JsonObject, JsonConvert, JsonProperty } from 'json2typescript';

import BucketsResultsFacetJson from './BucketsResultsFacetJson';

@JsonObject('BucketsResultsJson')
class BucketsResultsJson {
  private static jsonConvert = new JsonConvert();

  static Create(jsonObject: unknown): BucketsResultsJson {
    return BucketsResultsJson.jsonConvert.deserializeObject(jsonObject, BucketsResultsJson);
  }

  @JsonProperty('@odata.count', Number)
  count = 0;

  @JsonProperty('@search.facets')
  results: { [key: string]: BucketsResultsFacetJson[] } = {};
}

export default BucketsResultsJson;
