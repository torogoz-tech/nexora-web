import { parseNumberPage } from './parseNumberPage'
import { parsePullRequestComment } from './parsePullRequestComment'
export function parsePullRequestComments(value: unknown) {
  return parseNumberPage(value, parsePullRequestComment)
}
