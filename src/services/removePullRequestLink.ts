import { writeApiJson } from './writeApiJson'
import { parsePullRequestLink } from '../utils/parsePullRequestLink'
export async function removePullRequestLink(
  basePath: string,
  id: string,
  revision: number,
  reason: string,
  key: string,
  signal: AbortSignal,
) {
  return parsePullRequestLink(
    await writeApiJson(
      `${basePath}/links/${encodeURIComponent(id)}/remove`,
      { expected_revision: revision, reason },
      key,
      signal,
    ),
  )
}
