import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import ServiceRequestsPage from '../pages/ServiceRequestsPage'

const request = { id: 'srq_one', number: 12, title: 'Printer offline', body: '', status: 'new', type_id: 'support', type_name: 'Soporte', type_icon: 'wrench', type_color: '#8b5cf6', product_id: 'prd_one', product_name: 'Portal', requester_name: 'Ana', revision: 1, created_at: '2026-11-12T10:00:00Z', criticality: 'high', sla: null }

vi.mock('../hooks/useTranslation', () => ({ useTranslation: () => ({ t: (value: string) => value, dateLocale: 'es-SV' }) }))
vi.mock('../hooks/useApiData', () => ({ useApiData: (path: string) => path.includes('/products') ? { data: { items: [{ id: 'prd_one', name: 'Portal', archived: false }] }, loading: false, error: null, reload: vi.fn() } : { data: { items: [request], total: 1, can_manage: true }, loading: false, error: null, reload: vi.fn() } }))

describe('service request listing', () => {
  it('renders task-style filters and table columns for requests', () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/requests']}><ServiceRequestsPage /></MemoryRouter>)
    expect(html).toContain('Filtrar por tipo')
    expect(html).toContain('Criticidad')
    expect(html).toContain('<table')
    expect(html).toContain('Solicitante')
    expect(html).toContain('SLA')
    expect(html).toContain('Portal')
  })
})
