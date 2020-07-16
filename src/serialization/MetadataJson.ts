import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from './DateConverter';

@JsonObject('MetadataJson')
export class MetadataJson {
  @JsonProperty('Repository', String)
  repository: string = '';

  @JsonProperty('OfficialRepository', Boolean)
  repositoryOfficial: boolean = false;

  @JsonProperty('RepositoryStars', Number)
  stars: number = 0;

  @JsonProperty('BranchName', String, true)
  branchName?: string = '';

  @JsonProperty('FilePath', String)
  filePath: string = '';

  @JsonProperty('AuthorName', String)
  authorName: string = '';

  @JsonProperty('Committed', DateConverter)
  committed: Date = new Date();

  @JsonProperty('Sha', String)
  sha: string = '';
}
