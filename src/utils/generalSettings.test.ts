import { describe, expect, it, vi, afterEach } from 'vitest'
import { settingsMutationSignature } from './settingsMutationSignature'
import { parseServiceSettings } from './parseServiceSettings'
import { parseOrganizationProfile } from './parseOrganizationProfile'
import { parseNotificationRecipients } from './parseNotificationRecipients'
import { writeGeneralSettings } from '../services/writeGeneralSettings'
vi.mock('../services/getSession', () => ({ getSession: () => null }))
afterEach(() => vi.unstubAllGlobals())
describe('global settings boundaries', () => {
  it('keeps credentials out of the retained mutation signature while distinguishing replacements', async () => {
    const first = await settingsMutationSignature({
      settings: { enabled: true },
      secret: 'synthetic-a',
    })
    expect(first).toMatch(/^[a-f0-9]{64}$/)
    expect(first).not.toContain('synthetic')
    expect(
      await settingsMutationSignature({
        settings: { enabled: true },
        secret: 'synthetic-a',
      }),
    ).toBe(first)
    expect(
      await settingsMutationSignature({
        settings: { enabled: true },
        secret: 'synthetic-b',
      }),
    ).not.toBe(first)
  })
  it('retains safe configuration metadata without inventing credential values', () => {
    const value = {
      settings: {
        endpoint: 'https://gateway.example.invalid/v1',
        model: 'company/model',
        effort: 'medium',
        enabled: true,
      },
      has_secret: true,
      managed: true,
      revision: 2,
    }
    expect(parseServiceSettings(value)).toEqual(value)
    expect(parseServiceSettings(value)).not.toHaveProperty('secret')
    expect(() => parseServiceSettings({ ...value, settings: [] })).toThrow()
    expect(() => parseServiceSettings({ ...value, revision: 0 })).toThrow()
  })
  it('validates organization and recipient responses', () => {
    const org = {
      name: 'Empresa',
      address: 'Dirección',
      phone: '+503',
      country_code: 'SV',
      has_logo: false,
      revision: 1,
    }
    expect(parseOrganizationProfile(org)).toEqual(org)
    expect(() =>
      parseOrganizationProfile({ ...org, has_logo: 'yes' }),
    ).toThrow()
    expect(() =>
      parseNotificationRecipients([
        {
          actor_id: 'a',
          name: 'A',
          email: 'a@example.invalid',
          assignments: true,
          approvals: true,
          revision: -1,
        },
      ]),
    ).toThrow()
  })
  it('preserves the mutation key and handles conflicting saves explicitly', async () => {
    const request = vi.fn(async () => new Response('{}', { status: 409 }))
    vi.stubGlobal('fetch', request)
    await expect(
      writeGeneralSettings(
        '/api/v1/settings/organization',
        'PATCH',
        { expected_revision: 2, name: 'Empresa' },
        new AbortController().signal,
        'stable-key',
      ),
    ).rejects.toThrow('La configuración cambió en otra sesión.')
    const options = request.mock.calls[0] as unknown as [string, RequestInit]
    expect(new Headers(options[1].headers).get('Idempotency-Key')).toBe(
      'stable-key',
    )
    expect(JSON.parse(options[1].body as string)).toEqual({
      expected_revision: 2,
      name: 'Empresa',
    })
  })
})
