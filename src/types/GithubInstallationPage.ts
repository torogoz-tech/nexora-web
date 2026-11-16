import type { GithubInstallation } from './GithubInstallation'
export type GithubInstallationPage = {
  items: GithubInstallation[]
  next_page: number | null
  installation_url: string
}
