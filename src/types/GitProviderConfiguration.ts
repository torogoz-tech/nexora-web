import type { GitProvider } from './GitProvider'
export type GitProviderConfiguration = {
  provider: GitProvider
  client_id: string
  redirect_uri: string
  enabled: boolean
  revision: number
  host: string
  origin: string
  app_id?: string
  slug?: string
}
