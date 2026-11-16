import { expect, it } from 'vitest'
import { parseKnowledgeContent } from '../src/utils/parseKnowledgeContent'
import { getKnowledgeSections } from '../src/utils/getKnowledgeSections'

it('renders typed practices and technical debt without coercing them into ordinary documents', () => {
 const practice = parseKnowledgeContent({ kind: 'best_practice', body: { guideline: 'Explicit ownership', rationale: 'Reviewability', examples: ['One module'], source: 'Team review' } })
 expect(practice.kind).toBe('best_practice')
 expect(getKnowledgeSections(practice).map(section => section.text)).toContain('Explicit ownership')
 const debt = parseKnowledgeContent({ kind: 'technical_debt', body: { problem: 'Duplication', impact: 'Divergence', remediation: 'Consolidate policy', source: 'Review' } })
 expect(debt.kind).toBe('technical_debt')
 expect(getKnowledgeSections(debt).map(section => section.text)).toContain('Consolidate policy')
 expect(() => parseKnowledgeContent({ kind: 'technical_debt', body: { problem: 'Incomplete' } })).toThrow()
})
