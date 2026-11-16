import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Workflow, Palette, Infinity as InfinityIcon, ClipboardCheck } from 'lucide-react'
import { workflowIcons } from '../app/workflowIcons'
import { WorkNavigationContext } from '../app/WorkNavigationContext'
import type { WorkNavigationValue } from '../types/WorkNavigationValue'
import { parseWorkflowIcon } from '../utils/parseWorkflowIcon'
import { parseWorkflowSummary } from '../utils/parseWorkflowSummary'
import { getWorkflowIcon } from '../utils/getWorkflowIcon'
import { createWorkflowInput } from '../utils/createWorkflowInput'
import { validateWorkflowInput } from '../utils/validateWorkflowInput'
import WorkflowIconPicker from '../components/WorkflowIconPicker'
import BoardsContextNavigation from '../components/BoardsContextNavigation'
describe('workflow Lucide icons', () => {
  const workflow = { id: 'flow', name: 'Development', purpose: '', resource_kinds: ['task'], archived: false, revision: 1, latest_version_id: null, latest_version_number: 0 }
  it('provides recognizable area icons for UX/UI, DevOps and QA', () => {
    for (const [value, label, Icon] of [['palette', 'UX/UI', Palette], ['infinity', 'DevOps', InfinityIcon], ['clipboard-check', 'QA', ClipboardCheck]] as const) {
      expect(workflowIcons.find(option => option.value === value)?.label).toBe(label)
      expect(getWorkflowIcon(value)).toBe(Icon)
    }
    expect(getWorkflowIcon(undefined)).toBe(Workflow)
  })
  it('supports the curated icon catalog and a compatible default for existing workflows', () => {
    expect(workflowIcons).toHaveLength(48)
    expect(new Set(workflowIcons.map(icon => icon.value)).size).toBe(48)
    for (const option of workflowIcons) expect(parseWorkflowIcon(option.value)).toBe(option.value)
    expect(createWorkflowInput().icon).toBe('workflow')
    expect(parseWorkflowSummary(workflow).icon).toBe('workflow')
    expect(parseWorkflowSummary({ ...workflow, icon: 'rocket' }).icon).toBe('rocket')
  })
  it('rejects arbitrary icon payloads and safely renders unknown values as the default', () => {
    for (const value of ['<svg/>', 'constructor', '', {}, 4]) expect(() => parseWorkflowIcon(value)).toThrow()
    expect(getWorkflowIcon('constructor')).toBe(Workflow)
    const invalid = { ...createWorkflowInput(), name: 'Delivery', icon: 'invalid' } as unknown as ReturnType<typeof createWorkflowInput>
    expect(validateWorkflowInput(invalid)).toContain('El icono del workflow no es válido.')
  })
  it('labels the picker with the selected icon and respects archived/disabled editing', () => {
    const html = renderToStaticMarkup(<WorkflowIconPicker value="code" onChange={() => {}} disabled/>)
    expect(html).toContain('Icono del workflow: Desarrollo')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('lucide-code')
  })
  it('uses the workflow icon in its board submenu', () => {
    const state: WorkNavigationValue = { types: { items: [], total: 0, loading: false, error: null, reload() {} }, workflows: { items: [{ ...parseWorkflowSummary(workflow), icon: 'rocket' }], total: 1, loading: false, error: null, reload() {} } }
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/boards/flow']}><WorkNavigationContext value={state}><BoardsContextNavigation onClose={() => {}}/></WorkNavigationContext></MemoryRouter>)
    expect(html).toContain('lucide-rocket')
    expect(html).toContain('href="/boards/flow"')
    expect(html).toContain('aria-current="page"')
  })
})
