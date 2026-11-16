import { writeApiJson } from './writeApiJson'
import { parsePullRequestLink } from '../utils/parsePullRequestLink'
import type { PullRequestLinkInput } from '../types/PullRequestLinkInput'
export async function createPullRequestLink(
  basePath: string,
  input: PullRequestLinkInput,
  key: string,
  signal: AbortSignal,
) {
  return parsePullRequestLink(
    await writeApiJson(`${basePath}/links`, input, key, signal),
  )
}
