import type { KnowledgeContent } from '../types/KnowledgeContent'
import type { KnowledgeSection } from '../types/KnowledgeSection'
export function getKnowledgeSections(
  content: KnowledgeContent,
): KnowledgeSection[] {
  const fields: Record<string, string> = {
    text: 'Contenido',
    guideline: 'Buena práctica',
    rationale: 'Justificación',
    impact: 'Impacto',
    remediation: 'Plan de resolución',
    problem: 'Problema',
    objective: 'Objetivo',
    scope: 'Alcance',
    business_actors: 'Actores del negocio',
    acceptance_criteria: 'Criterios de aceptación',
    facts: 'Hechos',
    assumptions: 'Suposiciones',
    decisions: 'Decisiones',
    open_questions: 'Preguntas abiertas',
    statement: 'Regla de negocio',
    conditions: 'Condiciones',
    exceptions: 'Excepciones',
    examples: 'Ejemplos',
    evidence: 'Evidencia',
    context: 'Contexto',
    decision: 'Decisión',
    alternatives: 'Alternativas',
    consequences: 'Consecuencias',
    source: 'Fuentes',
  }
  const sections: KnowledgeSection[] = []
  for (const [key, title] of Object.entries(fields)) {
    const value = content.body[key]
    if (typeof value === 'string' && value.trim())
      sections.push({ id: `section-${key}`, title, text: value })
    else if (Array.isArray(value) && value.length)
      sections.push({ id: `section-${key}`, title, items: value as string[] })
  }
  const architecture = content.body.architecture
  if (architecture && typeof architecture === 'object')
    for (const [key, title] of Object.entries({
      style: 'Estilo de arquitectura',
      layers: 'Capas',
      conventions: 'Convenciones',
      dependency_restrictions: 'Restricciones de dependencias',
    })) {
      const value = (architecture as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim())
        sections.push({ id: `architecture-${key}`, title, text: value })
      else if (Array.isArray(value) && value.length)
        sections.push({
          id: `architecture-${key}`,
          title,
          items: value as string[],
        })
    }
  return sections
}
