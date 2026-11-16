// @vitest-environment jsdom
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import {afterEach,describe,expect,it,vi} from 'vitest'
import WorkflowStepEditor from '../components/WorkflowStepEditor'
import WorkflowStatePolicyEditor from '../components/WorkflowStatePolicyEditor'

afterEach(cleanup)
describe('workflow rule editing',()=>{
 it('starts an ordered pipeline with a single state change after approval',()=>{
  const onChange=vi.fn()
  render(<WorkflowStepEditor steps={[]} onChange={onChange}/>)
  fireEvent.click(screen.getByRole('button',{name:'Agregar paso'}))
  expect(onChange).toHaveBeenCalledWith([{kind:'require_approval'},{kind:'advance_state'}])
 })
 it('does not clear legacy guards or reorder stages when editing a PR branch',()=>{
  const onChange=vi.fn(),steps=[{kind:'create_pull_request' as const,source_branch:'develop',target_branch:'stage'},{kind:'advance_state' as const},{kind:'notify' as const,channel:'email' as const}]
  render(<WorkflowStepEditor steps={steps} onChange={onChange}/>)
  fireEvent.click(screen.getAllByRole('button',{name:'Configurar paso'})[0]!)
  fireEvent.change(screen.getByLabelText('Rama de destino'),{target:{value:'main'}})
  expect(onChange).toHaveBeenCalledWith([{...steps[0],target_branch:'main'},steps[1],steps[2]])
 })
 it('keeps explicit order separate from canvas position and supports clearing',()=>{
  const onChange=vi.fn()
  render(<WorkflowStatePolicyEditor state={{id:'start',name:'Start',progress_order:3}} onChange={onChange}/>)
  fireEvent.change(screen.getByLabelText('Orden de avance'),{target:{value:''}})
  expect(onChange).toHaveBeenCalledWith({progress_order:undefined})
  onChange.mockClear()
  fireEvent.change(screen.getByLabelText('Orden de avance'),{target:{value:'-1'}})
  expect(onChange).not.toHaveBeenCalled()
 })
})
