import { apiFetch } from './apiFetch'
import { integrationError } from '../utils/integrationError'
import { parseGitConnectionPage } from '../utils/parseGitConnectionPage'
import type { GitConnection } from '../types/GitConnection'
export async function getGitAccounts(
  signal: AbortSignal,
): Promise<GitConnection[]> {
  const accounts = new Map<string, GitConnection>()
  const cursors = new Set<string>()
  let after: string | null = null
  const deadline = AbortSignal.any([signal, AbortSignal.timeout(30000)])
  do {
    const response = await apiFetch(
      `/api/v1/git/connections?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`,
      { signal: deadline },
    )
    if (!response.ok) throw integrationError(response.status)
    const page = parseGitConnectionPage(await response.json())
    for (const account of page.items) accounts.set(account.id, account)
    after = page.next_cursor
    if (after) {
      if (cursors.has(after))
        throw new Error(
          'La API devolvió una página repetida de cuentas. Vuelve a intentarlo.',
        )
      cursors.add(after)
    }
  } while (after)
  return [...accounts.values()]
}
