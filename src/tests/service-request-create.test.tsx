// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ServiceRequestCreatePage from '../pages/ServiceRequestCreatePage'
import { writeServiceRequest } from '../services/writeServiceRequest'

vi.mock('../hooks/useTranslation', () => ({ useTranslation: () => ({ t: (value: string) => value }) }))
vi.mock('../hooks/useApiData', () => ({ useApiData: (path: string) => path.includes('/products') ? { data: { items: [] }, loading: false, error: null, reload: vi.fn() } : { data: { items: [{ id: 'support', name: 'Soporte', archived: false }] }, loading: false, error: null, reload: vi.fn() } }))
vi.mock('../components/MarkdownEditor', () => ({ default: ({ label }: { label: string }) => <textarea aria-label={label} /> }))
vi.mock('../services/writeServiceRequest', () => ({ writeServiceRequest: vi.fn() }))
vi.mock('../services/uploadRequestAttachment', () => ({ uploadRequestAttachment: vi.fn() }))

afterEach(() => cleanup())

describe('service request creation', () => {
  it('groups the request fields like the task form and keeps the primary action accessible', () => {
    const { container } = render(<MemoryRouter><ServiceRequestCreatePage /></MemoryRouter>)
    const html = container.innerHTML
    expect(html).toContain('sm:grid-cols-2')
    expect(html).toContain('aria-label="Descripción"')
    expect(html).toContain('Crear solicitud')
    expect(html).toContain('Adjuntar archivos')
  })

  it('locks editable fields after creating the request before uploading attachments', async () => {
    vi.mocked(writeServiceRequest).mockResolvedValue({
      id: 'srq_created',
      title: 'Solicitud',
      body: '',
      type_id: 'support',
      revision: 1,
      number: 1,
      status: 'new',
    })
    render(<MemoryRouter><ServiceRequestCreatePage /></MemoryRouter>)

    fireEvent.change(screen.getByRole('textbox', { name: 'Título' }), { target: { value: 'Solicitud' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear solicitud' }))

    await waitFor(() => expect(document.querySelector('fieldset')).toHaveProperty('disabled', true))
    expect(screen.getByLabelText('Adjuntar archivos')).toHaveProperty('disabled', true)
  })

})
