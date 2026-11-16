import WikiArticle from '../components/WikiArticle'
import { getWikiHeadings } from '../utils/getWikiHeadings'
import { parseKnowledgeContribution } from '../utils/parseKnowledgeContribution'
import { parseKnowledgeContributionPage } from '../utils/parseKnowledgeContributionPage'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseKnowledgeDocumentPage } from '../utils/parseKnowledgeDocumentPage'
import { parseKnowledgeVersion } from '../utils/parseKnowledgeVersion'
import { getKnowledgeSections } from '../utils/getKnowledgeSections'
import WikiMarkdown from '../components/WikiMarkdown'

describe('knowledge article contracts', () => {
  const version = {
    id: 'v1',
    document_id: 'doc1',
    project_id: 'p1',
    number: 1,
    title: 'Acceso',
    content: {
      kind: 'requirement',
      body: {
        problem: 'Acceso lento',
        objective: 'Acceder al sistema',
        scope: 'Usuarios',
        business_actors: ['Cliente'],
        acceptance_criteria: ['Sesión válida'],
        source: 'Entrevista',
        assumptions: ['Por confirmar'],
      },
    },
    origin: 'agent_proposed',
    state_id: 'draft',
    reason: 'Primera propuesta',
    created_by: 'agent',
    created_at: '2026-11-06T12:00:00Z',
    checksum: 'abc',
  }
  it('keeps assumptions, criteria and source in distinct article sections', () => {
    const sections = getKnowledgeSections(
      parseKnowledgeVersion(version).content,
    )
    expect(sections.find((s) => s.title === 'Suposiciones')?.items).toEqual([
      'Por confirmar',
    ])
    expect(
      sections.find((s) => s.title === 'Criterios de aceptación')?.items,
    ).toEqual(['Sesión válida'])
    expect(sections.find((s) => s.title === 'Fuentes')?.text).toBe('Entrevista')
  })
  it('rejects invalid structured content instead of rendering it as an article', () => {
    expect(() =>
      parseKnowledgeVersion({
        ...version,
        content: {
          kind: 'requirement',
          body: {
            ...version.content.body,
            acceptance_criteria: [{ script: 'x' }],
          },
        },
      }),
    ).toThrow()
    expect(() =>
      parseKnowledgeVersion({
        ...version,
        content: { kind: 'unknown', body: {} },
      }),
    ).toThrow()
  })
  it('preserves the pagination cursor and rejects a corrupt catalog', () => {
    expect(
      parseKnowledgeDocumentPage({ items: [], next_after: 'doc_next' })
        .next_after,
    ).toBe('doc_next')
    expect(() =>
      parseKnowledgeDocumentPage({
        items: [{ id: 'broken' }],
        next_after: null,
      }),
    ).toThrow()
  })
  it('renders headings, lists and tables without activating embedded HTML or unsafe links', () => {
    const html = renderToStaticMarkup(
      <WikiMarkdown
        text={
          '## Guía\n\n- Paso uno\n\n| Campo | Valor |\n| --- | --- |\n| A | B |\n\n<script>alert(1)</script>\n\n[ataque](javascript:alert(1))\n\n![remoto](https://track.example/image.png)'
        }
      />,
    )
    expect(html).toContain('<h3')
    expect(html).toContain('<table')
    expect(html).toContain('<li>')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('href="javascript:')
    expect(html).not.toContain('<img')
  })
})

describe('wiki article navigation', () => {
  it('links repeated headings independently and ignores headings inside code blocks', () => {
    const headings = getWikiHeadings(
      '## Resumen\n\n```md\n## No es una sección\n```\n\n## Resumen',
      'section-text',
    )
    expect(headings.map((item) => item.id)).toEqual([
      'section-text-line-1',
      'section-text-line-7',
    ])
    const html = renderToStaticMarkup(
      <WikiMarkdown
        text={'## Resumen\n\n## Resumen'}
        idPrefix="section-text"
      />,
    )
    expect(html).toContain('id="section-text-line-1"')
    expect(html).toContain('id="section-text-line-3"')
  })
})

describe('technical review provenance', () => {
  const contribution = {
    id: 'k1',
    actor: 'a1',
    created_at: '2026-11-06T12:00:00Z',
    state: 'accepted',
    validity: 'needs_review',
    effective: false,
    snapshot: 's1',
    operation: 'review',
    revision: 2,
    draft: {
      kind: 'explanation',
      statement: 'Validación en el dominio',
      evidence: [{ path: 'src/ticket.ts', start_line: 10, line_count: 3 }],
    },
  }
  it('keeps accepted contributions that need review distinct from effective knowledge', () => {
    const parsed = parseKnowledgeContribution(contribution)
    expect(parsed.state).toBe('accepted')
    expect(parsed.validity).toBe('needs_review')
    expect(parsed.effective).toBe(false)
  })
  it('rejects an impossible effective proposal', () => {
    expect(() =>
      parseKnowledgeContribution({
        ...contribution,
        state: 'proposed',
        validity: 'current',
        effective: true,
      }),
    ).toThrow()
  })
  it('preserves review pagination offsets and rejects corrupt evidence', () => {
    expect(
      parseKnowledgeContributionPage({
        items: [contribution],
        next_offset: 50,
        total: 51,
      }).next_offset,
    ).toBe(50)
    expect(() =>
      parseKnowledgeContribution({
        ...contribution,
        draft: {
          ...contribution.draft,
          evidence: [{ path: 'x', start_line: -1, line_count: 3 }],
        },
      }),
    ).toThrow()
  })
})

it('renders acceptance criteria with one list layer even when supplied as Markdown checkboxes', () => {
  const markup = renderToStaticMarkup(<WikiArticle title="Requisito" category="Requerimiento" metadata={[]} sections={[{id:'criteria',title:'Criterios',items:['- [ ] Primer criterio','- [x] Segundo criterio','Tercer criterio']}]}/> )
  expect(markup.match(/<ul/g)).toHaveLength(1)
  expect(markup.match(/<li/g)).toHaveLength(3)
  expect(markup).toContain('type="checkbox"')
})
