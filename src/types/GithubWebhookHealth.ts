export type GithubWebhookHealth = {
  status: {
    current?: boolean
    configuration_verified?: boolean
    url?: string
    push_subscribed?: boolean
  }
  last_delivery_at: string | null
}
