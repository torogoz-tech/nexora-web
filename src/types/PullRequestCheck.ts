export type PullRequestCheck = {
  name: string
  status: string
  conclusion: string | null
  web_url: string
  provider: string
}
