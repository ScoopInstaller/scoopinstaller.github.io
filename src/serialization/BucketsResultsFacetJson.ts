import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('BucketsResultsFacetJson')
class BucketsResultsFacetJson {
  @JsonProperty('count', Number)
  count = 0;

  @JsonProperty('value', String)
  value = '';
}

export default BucketsResultsFacetJson;
