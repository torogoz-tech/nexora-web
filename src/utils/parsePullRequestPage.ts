import { parseNumberPage } from './parseNumberPage'
import { parsePullRequest } from './parsePullRequest'
export function parsePullRequestPage(value: unknown) {
  return parseNumberPage(value, parsePullRequest)
}
