import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import FeatureDetailsPage from '../pages/FeatureDetailsPage'
import FeatureCatalogPage from '../pages/FeatureCatalogPage'
import { parseFeatureCatalog } from '../utils/parseFeatureCatalog'
import { decideFeatureProposal } from '../services/decideFeatureProposal'
import FeatureProposalDetails from '../components/FeatureProposalDetails'
vi.mock('../services/getSession', () => ({ getSession: () => null }))
vi.mock('../hooks/useProjectScope', () => ({ useProjectScope: () => ({ projectId: 'project', choices: [{ id: 'project', name: 'Proyecto piloto' }], loading: false, error: null, reload: () => {}, projects: { hasMore: false, pageError: null } }) }))
vi.mock('../hooks/useApiData', () => ({ useApiData: (path:string) => ({ data: path.startsWith('/api/v1/requests/linked')?[]:parseFeatureCatalog(catalog), loading: false, error: null, reload: () => {} }) }))
afterEach(() => vi.unstubAllGlobals())
const proposal = {
  id: 'p1', requirement_id: 'r1', requirement_title: 'Cobros', requirement_version_id: 'v1', reason: 'Separar cobro y devolución',
  result: null, status: 'pending', proposed_by: 'agent', decided_by: null, decision_reason: null, created_at: '2026-11-07', decided_at: null, revision: 1,
  links: [{ feature_id: 'f1', impact: 'Conservar el cobro' }, { name: 'Devolución', description: 'Revertir el cobro', impact: 'Nueva operación' }],
  tasks: [{ feature_index: 1, definition: { title: 'Implementar devolución' } }],
}
const catalog = {
  catalog_revision: 4,
  items: [{ id: 'f1', name: 'Cobro', description: '## Alcance\n\nCaptura **segura** de fondos', archived: false, revision: 2, created_at: '2026-11-07', requirement_ids: ['r1', 'r2'], task_ids: ['t1'] }],
  proposals: [proposal], can_decide: true,
  links: [{ requirement_id: 'r1', feature_id: 'f1', proposal_id: 'older', impact: 'Cobrar' }, { requirement_id: 'r2', feature_id: 'f1', proposal_id: 'other', impact: 'Capturar' }],
}
describe('governed feature mappings', () => {
  it('links titles to details without displaying catalog bodies or redundant view controls', () => {
    const markup = renderToStaticMarkup(<MemoryRouter><FeatureCatalogPage /></MemoryRouter>)
    expect(markup).toContain('/knowledge/features/f1?project=project')
    expect(markup).toContain('/knowledge/features/proposals/p1?project=project')
    expect(markup).not.toContain('Captura')
    expect(markup).not.toContain('Conservar el cobro')
    expect(markup).not.toContain('Ver propuesta')
    expect(markup).toMatch(/<div class="flex items-center justify-between gap-3"><h1[^>]*>Funcionalidades<\/h1>/)
  })
  it('renders feature Markdown and clearly identifies related requirements on its own page', () => {
    const markup = renderToStaticMarkup(<MemoryRouter initialEntries={['/knowledge/features/f1?project=project']}><FeatureDetailsPage id="f1"/></MemoryRouter>)
    expect(markup).toContain('<strong>segura</strong>')
    expect(markup).toContain('Requerimientos vinculados')
    expect(markup).toContain('article=r1')
    expect(markup).toContain('article=r2')
    expect(markup).toContain('Requerimiento</p>')
  })
  it('preserves many-to-many mappings, optional new feature fields and proposed task definitions', () => {
    const parsed = parseFeatureCatalog(catalog)
    expect(parsed.catalog_revision).toBe(4)
    expect(parsed.items[0].task_ids).toEqual(['t1'])
    expect(parsed.links.map(link => link.requirement_id)).toEqual(['r1', 'r2'])
    expect(parsed.proposals[0].links[0].name).toBeNull()
    expect(parsed.proposals[0].links[1].feature_id).toBeNull()
    expect(parsed.proposals[0].tasks[0].definition).toEqual({ title: 'Implementar devolución' })
  })
  it('preserves approved feature and task results', () => {
    const parsed = parseFeatureCatalog({ ...catalog, proposals: [{ ...proposal, status: 'approved', result: { feature_ids: ['f1', 'f2'], task_ids: ['t2'] } }] })
    expect(parsed.proposals[0].result).toEqual({ feature_ids: ['f1', 'f2'], task_ids: ['t2'] })
    const markup = renderToStaticMarkup(<FeatureProposalDetails projectId="project" proposal={parsed.proposals[0]} features={parsed.items} canDecide onClose={() => {}} onSaved={() => {}} />)
    expect(markup).toContain('Tareas creadas')
    expect(markup).not.toContain('Aprobar propuesta')
  })
  it('rejects invalid authority, status, revision and unnamed new features', () => {
    expect(() => parseFeatureCatalog({ ...catalog, can_decide: 'true' })).toThrow()
    for (const invalid of [{ ...proposal, status: 'unknown' }, { ...proposal, revision: 0 }, { ...proposal, links: [{ impact: 'x' }] }]) {
      expect(() => parseFeatureCatalog({ ...catalog, proposals: [invalid] })).toThrow()
    }
  })
  it('exposes decision controls only for authorized pending proposals and renders task titles', () => {
    const parsed = parseFeatureCatalog(catalog)
    const props = { projectId: 'project', proposal: parsed.proposals[0], features: parsed.items, onClose: () => {}, onSaved: () => {} }
    const allowed = renderToStaticMarkup(<FeatureProposalDetails {...props} canDecide />)
    expect(allowed).toContain('Aprobar propuesta')
    expect(allowed).not.toContain('<textarea')
    expect(allowed).not.toContain('disabled=')
    expect(allowed).toContain('Implementar devolución')
    expect(allowed).toContain('Nueva funcionalidad')
    expect(renderToStaticMarkup(<FeatureProposalDetails {...props} canDecide={false} />)).not.toContain('Aprobar propuesta')
    expect(renderToStaticMarkup(<FeatureProposalDetails {...props} proposal={{ ...props.proposal, status: 'approved' }} canDecide />)).not.toContain('Aprobar propuesta')
  })
  it('sends expected revision, reason and idempotency key, refusing conflict responses', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetcher)
    await decideFeatureProposal('project/a', 'p1', 3, 'approved', '  Revisado  ', 'key1', new AbortController().signal)
    const [path, request] = fetcher.mock.calls[0]
    expect(path).toBe('/api/v1/projects/project%2Fa/feature-proposals/p1/decision')
    expect(JSON.parse(request.body)).toEqual({ expected_revision: 3, decision: 'approved', reason: 'Revisado' })
    expect(new Headers(request.headers).get('Idempotency-Key')).toBe('key1')
    fetcher.mockResolvedValue(new Response(null, { status: 409 }))
    await expect(decideFeatureProposal('project', 'p1', 3, 'rejected', 'No cumple', 'key2', new AbortController().signal)).rejects.toThrow('La propuesta cambió')
  })
})
