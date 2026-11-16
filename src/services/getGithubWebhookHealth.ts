import { apiFetch } from './apiFetch'
import type { GithubWebhookHealth } from '../types/GithubWebhookHealth'
export async function getGithubWebhookHealth(signal?: AbortSignal): Promise<GithubWebhookHealth> {
  const response = await apiFetch('/api/v1/git/github/webhook-health', { signal })
  if (!response.ok) throw new Error('webhook-health')
  const value: unknown = await response.json()
  if (!value || typeof value !== 'object' || !('status' in value) || !value.status || typeof value.status !== 'object') throw new Error('webhook-health')
  return value as GithubWebhookHealth
}
