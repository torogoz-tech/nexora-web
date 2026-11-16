import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createWorkflowInput } from '../utils/createWorkflowInput'
import { validateWorkflowInput } from '../utils/validateWorkflowInput'
import WorkflowCanvasTransition from '../components/WorkflowCanvasTransition'

describe('simple workflow connections', () => {
  it('accepts unnamed arrows while keeping reachability and condition validation', () => {
    const input = { ...createWorkflowInput(), name: 'Delivery' }
    expect(input.graph.transitions[0].name).toBe('')
    expect(validateWorkflowInput(input)).toEqual([])
    expect(validateWorkflowInput({ ...input, graph: { ...input.graph, transitions: [] } })).toContain('Todos los estados deben ser alcanzables desde el estado inicial.')
    expect(validateWorkflowInput({ ...input, graph: { states: [input.graph.states[0]], transitions: [] } })).toEqual([])
  })
  it('renders every connection as an unnamed transition circle', () => {
    const transition = createWorkflowInput().graph.transitions[0]
    const props = { transition, position: { x: 100, y: 100 }, selected: false }
    expect(renderToStaticMarkup(<WorkflowCanvasTransition {...props}/>)).toContain('rounded-full')
    const editable = renderToStaticMarkup(<WorkflowCanvasTransition {...props} onSelect={() => {}} onEdit={() => {}}/>)
    expect(editable).toContain('Configurar transición')
    expect(renderToStaticMarkup(<WorkflowCanvasTransition {...props} transition={{ ...transition, name: 'Approve' }}/>)).not.toContain('Approve')
  })
})
