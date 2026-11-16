// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import MarkdownDiagram from '../components/MarkdownDiagram'
const renderDiagram = vi.hoisted(() => vi.fn())
vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), render: renderDiagram },
}))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('isolates Mermaid SVG in a sandbox with no script or network permissions', async () => {
  renderDiagram.mockResolvedValue({
    svg: '<svg viewBox="0 0 100 40"><text>Start</text></svg>',
  })
  render(<MarkdownDiagram code="flowchart LR\nA-->B" />)
  const frame = await screen.findByTitle('Diagrama')
  expect(frame.getAttribute('sandbox')).toBe('')
  expect(frame.getAttribute('srcdoc')).toContain("default-src 'none'")
  expect(frame.getAttribute('srcdoc')).toContain('<text>Start</text>')
})
it('shows a syntax error and cleans its hidden render container', async () => {
  renderDiagram.mockRejectedValue(Error('invalid syntax'))
  const { container } = render(<MarkdownDiagram code="invalid" />)
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('sintaxis Mermaid'),
  )
  expect(document.body.children.length).toBe(1)
  expect(container.querySelector('iframe')).toBeNull()
})
