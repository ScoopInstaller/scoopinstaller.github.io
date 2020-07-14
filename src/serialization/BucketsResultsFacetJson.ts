import { JsonObject, JsonConvert, JsonProperty } from 'json2typescript';

@JsonObject('BucketsResultsFacetJson')
export class BucketsResultsFacetJson {
  @JsonProperty('count', Number)
  count: number = 0;

  @JsonProperty('value', String)
  value: string = '';
}
