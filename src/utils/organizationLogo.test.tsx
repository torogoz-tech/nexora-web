import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { getContainedLogoBounds } from './getContainedLogoBounds'
import { prepareMemberPhoto } from './prepareMemberPhoto'
import { prepareOrganizationLogo } from './prepareOrganizationLogo'
import { canRebaseOrganizationChange } from './canRebaseOrganizationChange'
import { writeOrganizationSetting } from '../services/writeOrganizationSetting'
import { readGeneralSettingsResponse } from '../services/readGeneralSettingsResponse'
import OrganizationLogoSetting from '../components/OrganizationLogoSetting'
import OrganizationTextSetting from '../components/OrganizationTextSetting'
import OrganizationCountrySetting from '../components/OrganizationCountrySetting'
vi.mock('../services/getSession', () => ({ getSession: () => null }))
afterEach(() => vi.unstubAllGlobals())
const profile = {
  name: 'Example',
  address: '',
  phone: '',
  country_code: 'SV',
  has_logo: false,
  revision: 1,
}
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  })
describe('independent organization settings', () => {
  it('fits small, wide and tall logos without cropping or distortion', () => {
    expect(getContainedLogoBounds(64, 32)).toEqual({
      x: 0,
      y: 128,
      width: 512,
      height: 256,
    })
    expect(getContainedLogoBounds(32, 64)).toEqual({
      x: 128,
      y: 0,
      width: 256,
      height: 512,
    })
    expect(getContainedLogoBounds(24, 24)).toEqual({
      x: 0,
      y: 0,
      width: 512,
      height: 512,
    })
    expect(() => getContainedLogoBounds(4097, 100)).toThrow('4096')
  })
  it('accepts image signatures with missing MIME metadata and prepares a 512px PNG', async () => {
    const close = vi.fn(),
      drawImage = vi.fn(),
      image = { width: 64, height: 32, close }
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => image),
    )
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage }),
      toBlob: (callback: (blob: Blob) => void) =>
        callback(new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })),
    }
    vi.stubGlobal('document', { createElement: () => canvas })
    const file = new File(
      [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])],
      'logo.png',
      { type: '' },
    )
    expect(
      await prepareOrganizationLogo(file, new AbortController().signal),
    ).toBe('AQID')
    expect(canvas.width).toBe(512)
    expect(canvas.height).toBe(512)
    expect(drawImage).toHaveBeenCalledWith(image, 0, 128, 512, 256)
    expect(close).toHaveBeenCalledOnce()
    await prepareMemberPhoto(file, new AbortController().signal)
    expect(drawImage).toHaveBeenLastCalledWith(image, -256, 0, 1024, 512)
  })
  it('rejects unsupported content and oversize files with specific errors', async () => {
    await expect(
      prepareOrganizationLogo(
        new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' }),
        new AbortController().signal,
      ),
    ).rejects.toThrow('PNG, JPEG o WebP')
    await expect(
      prepareOrganizationLogo(
        new File([new Uint8Array(2097153)], 'logo.png'),
        new AbortController().signal,
      ),
    ).rejects.toThrow('2 MB')
  })
  it('renders a separate form for the logo and every editable field', () => {
    const onUpdated = () => {}
    const html = renderToStaticMarkup(
      <>
        <OrganizationLogoSetting profile={profile} onUpdated={onUpdated} />
        {(['name', 'address', 'phone'] as const).map((field) => (
          <OrganizationTextSetting
            key={field}
            profile={profile}
            onUpdated={onUpdated}
            field={field}
            label={field}
          />
        ))}
        <OrganizationCountrySetting profile={profile} onUpdated={onUpdated} />
      </>,
    )
    expect(html.match(/<form /g)).toHaveLength(5)
    expect(html).not.toContain('<fieldset')
    expect(html).toContain('aria-label="Logo de la organización"')
  })
  it('rebases unrelated concurrent saves while preserving the intended field', async () => {
    const latest = { ...profile, has_logo: true, revision: 2 },
      saved = { ...latest, name: 'New name', revision: 3 }
    const request = vi
      .fn()
      .mockResolvedValueOnce(json({}, 409))
      .mockResolvedValueOnce(json(latest))
      .mockResolvedValueOnce(json(saved))
    vi.stubGlobal('fetch', request)
    expect(
      await writeOrganizationSetting(
        profile,
        { field: 'name', value: 'New name' },
        new AbortController().signal,
        'name-key',
      ),
    ).toEqual(saved)
    const retry = request.mock.calls[2][1] as RequestInit
    expect(JSON.parse(retry.body as string)).toEqual({
      expected_revision: 2,
      name: 'New name',
    })
    expect(new Headers(retry.headers).get('Idempotency-Key')).toBe(
      'name-key:rebase',
    )
  })
  it('does not overwrite a concurrent edit of the same field', async () => {
    const latest = { ...profile, name: 'Someone else', revision: 2 }
    const request = vi
      .fn()
      .mockResolvedValueOnce(json({}, 409))
      .mockResolvedValueOnce(json(latest))
    vi.stubGlobal('fetch', request)
    await expect(
      writeOrganizationSetting(
        profile,
        { field: 'name', value: 'My edit' },
        new AbortController().signal,
        'name-key',
      ),
    ).rejects.toThrow('otra sesión')
    expect(request).toHaveBeenCalledTimes(2)
    expect(
      canRebaseOrganizationChange(
        { ...profile, has_logo: true },
        { ...profile, has_logo: true, revision: 2 },
        { field: 'logo', value: 'png' },
      ),
    ).toBe(false)
  })
  it('distinguishes image decoding failures from unrelated validation errors', async () => {
    await expect(
      readGeneralSettingsResponse(
        json({ title: 'invalid input: invalid logo image' }, 422),
        '/api/v1/settings/organization/logo',
      ),
    ).rejects.toThrow('archivo no esté dañado')
    await expect(
      readGeneralSettingsResponse(
        json({ title: 'invalid logo request' }, 422),
        '/api/v1/settings/organization/logo',
      ),
    ).rejects.toThrow('La API rechazó el logo')
  })
})
