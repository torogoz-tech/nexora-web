// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import GithubWebhookHealth from '../src/components/GithubWebhookHealth'
vi.mock('../src/services/apiFetch', () => ({ apiFetch: vi.fn() }))
import { apiFetch } from '../src/services/apiFetch'
afterEach(() => { cleanup(); vi.resetAllMocks() })
it('separates configuration verification from real event receipt and missing push subscription', async () => {
  vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify({ status: { current: true, configuration_verified: true, push_subscribed: false }, last_delivery_at: null })))
  const view = render(<GithubWebhookHealth/>)
  await waitFor(() => expect(view.getByText('URL y secreto sincronizados con GitHub.')).toBeTruthy())
  expect(view.getByText('Activa el evento Push en la configuración de tu GitHub App.')).toBeTruthy()
  expect(view.getByText(/Todavía no se ha recibido una entrega/)).toBeTruthy()
})
it('rechecks explicitly, reports a failure and releases the action button', async () => {
  vi.mocked(apiFetch).mockImplementation(async (_path, init) => init?.method === 'POST' ? new Response('{}', { status: 503 }) : new Response(JSON.stringify({ status: { current: false }, last_delivery_at: null })))
  const view = render(<GithubWebhookHealth/>)
  const button = view.getByRole('button', { name: 'Comprobar y sincronizar webhook' })
  fireEvent.click(button)
  await waitFor(() => expect(view.getByRole('alert')).toBeTruthy())
  expect(button.hasAttribute('disabled')).toBe(false)
  expect(apiFetch).toHaveBeenCalledWith('/api/v1/git/github/webhook-health', { method: 'POST' }, 30000)
})
