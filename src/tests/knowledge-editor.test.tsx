// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import KnowledgeEditorForm from '../components/KnowledgeEditorForm'
import { uploadKnowledgeImage } from '../services/uploadKnowledgeImage'
import { apiFetch } from '../services/apiFetch'
vi.mock('../services/apiFetch', () => ({ apiFetch: vi.fn() }))
vi.mock('../services/uploadKnowledgeImage', () => ({
  uploadKnowledgeImage: vi.fn(),
}))
function Location() {
  return <output>{useLocation().pathname}</output>
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('saves Markdown with diagrams on its own page and returns to the document', async () => {
  vi.mocked(apiFetch).mockResolvedValue(
    new Response(JSON.stringify({ id: 'knc_created' }), { status: 200 }),
  )
  render(
    <MemoryRouter>
      <KnowledgeEditorForm
        source="contribution"
        kind="document"
        projectId="prj_scope"
        canEdit
      />
      <Location />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByRole('textbox', { name: 'Título' }), {
    target: { value: 'Architecture' },
  })
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Contenido Markdown' }),
    { target: { value: '# Architecture' } },
  )
  fireEvent.click(screen.getByRole('button', { name: 'Insertar diagrama' }))
  expect(
    (
      screen.getByRole('textbox', {
        name: 'Contenido Markdown',
      }) as HTMLTextAreaElement
    ).value,
  ).toContain('```mermaid')
  fireEvent.submit(document.getElementById('knowledge-editor')!)
  await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1))
  const [url, options] = vi.mocked(apiFetch).mock.calls[0]
  expect(url).toBe('/api/v1/knowledge/contributions')
  const body = JSON.parse(options!.body as string)
  expect(body.project_id).toBe('prj_scope')
  expect(body.body).toContain('```mermaid')
  expect(options!.headers).toHaveProperty('Idempotency-Key')
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe('/knowledge'),
  )
})
it('updates the loaded revision without changing the organization scope', async () => {
  vi.mocked(apiFetch).mockResolvedValue(
    new Response(JSON.stringify({ id: 'okn_saved' }), { status: 200 }),
  )
  render(
    <MemoryRouter>
      <KnowledgeEditorForm
        id="okn_saved"
        source="organization"
        kind="business_rule"
        projectId={null}
        document={{ title: 'Rule', body: '# Rule', revision: 7 }}
        canEdit
      />
    </MemoryRouter>,
  )
  fireEvent.submit(document.getElementById('knowledge-editor')!)
  await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1))
  const [url, options] = vi.mocked(apiFetch).mock.calls[0]
  expect(url).toBe('/api/v1/knowledge/organization/documents/okn_saved')
  expect(options!.method).toBe('PATCH')
  const body = JSON.parse(options!.body as string)
  expect(body.expected_revision).toBe(7)
  expect(body).not.toHaveProperty('project_id')
})

it('stores a pasted image before saving its Markdown URL', async () => {
  vi.mocked(uploadKnowledgeImage).mockResolvedValue({
    url: '/api/v1/knowledge/images/kim_pasted/content',
    name: 'design.png',
  })
  render(
    <MemoryRouter>
      <KnowledgeEditorForm
        source="contribution"
        kind="document"
        projectId="prj_scope"
        canEdit
      />
    </MemoryRouter>,
  )
  const input = screen.getByRole('textbox', { name: 'Contenido Markdown' })
  const file = new File(['image'], 'design.png', { type: 'image/png' })
  fireEvent.paste(input, {
    clipboardData: {
      items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }],
    },
  })
  await waitFor(() =>
    expect((input as HTMLTextAreaElement).value).toContain(
      '/api/v1/knowledge/images/kim_pasted/content',
    ),
  )
  expect(uploadKnowledgeImage).toHaveBeenCalledWith(file, 'prj_scope')
  expect((input as HTMLTextAreaElement).value).not.toContain('nexora-upload:')
})
