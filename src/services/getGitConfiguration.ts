import { apiFetch } from './apiFetch'
import { parseGitConfiguration } from '../utils/parseGitConfiguration'
import { integrationError } from '../utils/integrationError'
import type { GitProvider } from '../types/GitProvider'
import type { GitConfigurationState } from '../types/GitConfigurationState'
export async function getGitConfiguration(
  provider: GitProvider,
  signal: AbortSignal,
): Promise<GitConfigurationState> {
  const response = await apiFetch(`/api/v1/git/${provider}/configuration`, {
    signal,
  })
  if (response.status === 404) return { status: 'missing', configuration: null }
  if (response.status === 403)
    return { status: 'restricted', configuration: null }
  if (!response.ok) throw integrationError(response.status)
  return {
    status: 'ready',
    configuration: parseGitConfiguration(await response.json(), provider),
  }
}
