import { JsonObject, JsonProperty } from 'json2typescript';

import DateConverter from './DateConverter';

@JsonObject('MetadataJson')
class MetadataJson {
  @JsonProperty('Repository', String)
  repository = '';

  @JsonProperty('OfficialRepository', Boolean)
  repositoryOfficial = false;

  @JsonProperty('RepositoryStars', Number)
  stars = 0;

  @JsonProperty('BranchName', String, true)
  branchName?: string = '';

  @JsonProperty('FilePath', String)
  filePath = '';

  @JsonProperty('AuthorName', String)
  authorName = '';

  @JsonProperty('Committed', DateConverter)
  committed: Date = new Date();

  @JsonProperty('Sha', String)
  sha = '';
}

export default MetadataJson;
