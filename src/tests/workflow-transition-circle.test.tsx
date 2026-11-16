// @vitest-environment jsdom
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WorkflowCanvasTransition from '../components/WorkflowCanvasTransition'
import WorkflowTransitionEditor from '../components/WorkflowTransitionEditor'
import { createWorkflowInput } from '../utils/createWorkflowInput'

afterEach(cleanup)
describe('workflow transition circle', () => {
  it('keeps empty transitions visible and hides legacy labels', () => {
    const transition = createWorkflowInput().graph.transitions[0]
    const { rerender } = render(<WorkflowCanvasTransition transition={transition} position={{x:100,y:100}} selected={false}/>)
    expect(screen.getByLabelText('Transición')).toBeTruthy()
    rerender(<WorkflowCanvasTransition transition={{...transition,name:'Legacy title'}} position={{x:100,y:100}} selected={false}/>)
    expect(screen.queryByText('Legacy title')).toBeNull()
    expect(screen.getByLabelText('Transición').className).toContain('rounded-full')
  })
  it('selects on click and opens properties on double click or keyboard activation', () => {
    const transition = createWorkflowInput().graph.transitions[0], onSelect = vi.fn(), onEdit = vi.fn()
    render(<WorkflowCanvasTransition transition={transition} position={{x:100,y:100}} selected={false} onSelect={onSelect} onEdit={onEdit}/>)
    const button = screen.getByRole('button', {name:'Configurar transición'})
    fireEvent.click(button, {detail:1})
    expect(onSelect).toHaveBeenCalledWith(transition.id)
    expect(onEdit).not.toHaveBeenCalled()
    fireEvent.doubleClick(button)
    expect(onEdit).toHaveBeenCalledWith(transition.id)
    onEdit.mockClear()
    fireEvent.click(button, {detail:0})
    expect(onEdit).toHaveBeenCalledWith(transition.id)
  })
  it('edits conditions without exposing or erasing historical transition names', () => {
    const graph = createWorkflowInput().graph
    graph.transitions[0].name = 'Historical title'
    render(<WorkflowTransitionEditor graph={graph} selectedId={graph.transitions[0].id} disabled={false} taskOnly onChange={()=>{}}/>)
    expect(screen.queryByText('Nombre de la transición')).toBeNull()
    expect(screen.queryByDisplayValue('Historical title')).toBeNull()
    expect(screen.getByLabelText('Eliminar transición')).toBeTruthy()
  })
})

it('shows final actions without asking for a destination or pretending to change state', () => {
  HTMLElement.prototype.hidePopover = vi.fn()
  const graph = createWorkflowInput().graph
  const end = graph.states.find(state => state.terminal)!
  const edge = {...graph.transitions[0]!, from:end.id, to:end.id, automatic:true, steps:[{kind:'advance_state' as const}]}
  graph.transitions = [edge]
  render(<WorkflowTransitionEditor graph={graph} selectedId={edge.id} disabled={false} taskOnly onChange={()=>{}} />)
  expect(screen.queryByRole('combobox', {name:'Estado de destino'})).toBeNull()
  expect(screen.queryByText('Cambiar estado automáticamente')).toBeNull()
  expect(screen.getByText('Conservar estado final')).toBeTruthy()
})
