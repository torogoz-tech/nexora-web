import { requireRecord } from './requireRecord'
import type { GithubInstallationPage } from '../types/GithubInstallationPage'
export function parseGithubInstallationPage(
  value: unknown,
): GithubInstallationPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    typeof v.installation_url !== 'string' ||
    (v.next_page !== null &&
      (!Number.isSafeInteger(v.next_page) || Number(v.next_page) < 1))
  )
    throw new Error('No pudimos leer las instalaciones de GitHub.')
  return {
    items: v.items.map((value) => {
      const x = requireRecord(value)
      if (
        !['id', 'account_login', 'repository_selection'].every(
          (k) => typeof x[k] === 'string',
        )
      )
        throw new Error('La instalación no es válida.')
      return {
        id: String(x.id),
        account_login: String(x.account_login),
        repository_selection: String(x.repository_selection),
      }
    }),
    next_page: v.next_page as number | null,
    installation_url: v.installation_url,
  }
}
