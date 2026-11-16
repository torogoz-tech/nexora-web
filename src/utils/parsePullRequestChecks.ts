import { parseNumberPage } from './parseNumberPage'
import { parsePullRequestCheck } from './parsePullRequestCheck'
export function parsePullRequestChecks(value: unknown) {
  return parseNumberPage(value, parsePullRequestCheck)
}
