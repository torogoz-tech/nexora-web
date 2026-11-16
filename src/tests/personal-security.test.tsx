import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import PersonalSecurityPage from '../pages/PersonalSecurityPage'

vi.mock('../hooks/useTranslation', () => ({ useTranslation: () => ({ t: (value: string) => value, language: 'es' }) }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: { actorId: 'actor_one' }, logout: vi.fn() }) }))
vi.mock('../hooks/useApiData', () => ({ useApiData: (path: string) => ({ data: path.includes('/totp') ? { enrolled: true, exempt: false } : path.includes('/passkeys') ? { enabled: false, credentials: [] } : null, loading: false, error: null, reload: vi.fn() }) }))
vi.mock('../app/WorkspacePermissionsContext', () => ({ WorkspacePermissionsContext: { Provider: ({ children }: { children: unknown }) => children, Consumer: () => null } }))

describe('personal security', () => {
  it('shows TOTP state and the passkey registration action', () => {
    const html = renderToStaticMarkup(<MemoryRouter><PersonalSecurityPage /></MemoryRouter>)
    expect(html).toContain('Seguridad personal')
    expect(html).toContain('Autenticador configurado')
    expect(html).toContain('Passkey')
    expect(html).toContain('Configurar Passkey')
  })
})
