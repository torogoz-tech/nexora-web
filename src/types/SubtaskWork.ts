export type SubtaskWork = {
  workKind:'decomposition'|'corrective'
  testedRepositoryId?:string|null
  testedCommitSha?:string|null
}
