import type { GitConnection } from '../types/GitConnection'
import type { GitProvider } from '../types/GitProvider'
export function filterGitAccounts(
  accounts: GitConnection[],
  search: string,
  provider: GitProvider | 'all',
): GitConnection[] {
  const query = search.trim().toLocaleLowerCase()
  return accounts.filter(
    (account) =>
      (provider === 'all' || account.provider === provider) &&
      [
        account.remote_login,
        account.host,
        account.provider,
        account.installation_id ?? '',
      ].some((value) => value.toLocaleLowerCase().includes(query)),
  )
}
