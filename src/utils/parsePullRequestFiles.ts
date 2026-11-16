import { parseNumberPage } from './parseNumberPage'
import { parsePullRequestFile } from './parsePullRequestFile'
export function parsePullRequestFiles(value: unknown) {
  return parseNumberPage(value, parsePullRequestFile)
}
