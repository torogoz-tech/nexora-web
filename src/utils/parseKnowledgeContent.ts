import { requireRecord } from './requireRecord'
import type { KnowledgeContent } from '../types/KnowledgeContent'
export function parseKnowledgeContent(value: unknown): KnowledgeContent {
  const v = requireRecord(value),
    body = requireRecord(v.body)
  const schemas: Record<
    string,
    { text: string[]; lists: string[]; optional: string[] }
  > = {
    document: { text: ['text', 'source'], lists: [], optional: [] },
    best_practice: { text: ['guideline', 'rationale', 'source'], lists: [], optional: ['examples'] },
    technical_debt: { text: ['problem', 'impact', 'remediation', 'source'], lists: [], optional: [] },
    requirement: {
      text: ['problem', 'objective', 'scope', 'source'],
      lists: ['business_actors', 'acceptance_criteria'],
      optional: ['facts', 'assumptions', 'decisions', 'open_questions'],
    },
    business_rule: {
      text: ['statement', 'source'],
      lists: ['conditions'],
      optional: ['exceptions', 'examples', 'evidence'],
    },
    decision: {
      text: ['context', 'decision', 'source'],
      lists: ['alternatives', 'consequences'],
      optional: [],
    },
  }
  const schema =
    typeof v.kind === 'string' && Object.hasOwn(schemas, v.kind)
      ? schemas[v.kind]
      : undefined
  if (
    !schema ||
    Object.keys(body).some(
      (key) =>
        ![
          ...schema.text,
          ...schema.lists,
          ...schema.optional,
          ...(v.kind === 'document' ? ['architecture'] : []),
        ].includes(key),
    ) ||
    schema.text.some((key) => typeof body[key] !== 'string') ||
    [
      ...schema.lists,
      ...schema.optional.filter((key) => body[key] !== undefined),
    ].some(
      (key) =>
        !Array.isArray(body[key]) ||
        !(body[key] as unknown[]).every((item) => typeof item === 'string'),
    )
  )
    throw new Error('El contenido del artículo no es válido.')
  if (body.architecture != null) {
    const a = requireRecord(body.architecture)
    if (
      typeof a.style !== 'string' ||
      ['layers', 'conventions', 'dependency_restrictions'].some(
        (key) =>
          !Array.isArray(a[key]) ||
          !(a[key] as unknown[]).every((item) => typeof item === 'string'),
      )
    )
      throw new Error('La arquitectura del artículo no es válida.')
  }
  return { kind: v.kind as KnowledgeContent['kind'], body }
}
