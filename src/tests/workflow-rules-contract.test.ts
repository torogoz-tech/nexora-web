import {describe,it,expect} from 'vitest'
import {createWorkflowInput} from '../utils/createWorkflowInput'
import {parseWorkflowGraph} from '../utils/parseWorkflowGraph'
import {validateWorkflowInput} from '../utils/validateWorkflowInput'

describe('workflow rule contracts',()=>{
 it('preserves state policies and ordered steps through an edit round trip',()=>{
  const graph=createWorkflowInput().graph
  const value={states:graph.states.map((state,index)=>({...state,progress_order:index,prevent_backtracking:true,required_base_branch:'develop'})),transitions:graph.transitions.map(edge=>({...edge,steps:[{kind:'require_approval'},{kind:'verify_push'},{kind:'create_pull_request',source_branch:'develop',target_branch:'stage'},{kind:'advance_state'},{kind:'notify',channel:'email'}]}))}
  expect(parseWorkflowGraph(value)).toEqual(value)
 })
 it('accepts omitted legacy names without exposing undefined',()=>{
  const graph=createWorkflowInput().graph
  const value={...graph,transitions:graph.transitions.map(edge=>({id:edge.id,from:edge.from,to:edge.to,guards:edge.guards}))}
  expect(parseWorkflowGraph(value).transitions[0].name).toBe('')
 })
 it('allows notification before advancement for review approval requests',()=>{
  const input=createWorkflowInput();input.name='Delivery'
  const graph={...input.graph,transitions:input.graph.transitions.map(edge=>({...edge,steps:[{kind:'notify',channel:'email'},{kind:'advance_state'}]}))}
  expect(validateWorkflowInput({...input,graph} as typeof input)).toEqual([])
 })
 it('rejects backtracking without explicit state order and unknown action properties',()=>{
  const graph=createWorkflowInput().graph
  expect(()=>parseWorkflowGraph({...graph,transitions:graph.transitions.map(edge=>({...edge,steps:[{kind:'advance_state',execute_script:'not allowed'}]}))})).toThrow()
  const input={...createWorkflowInput(),name:'Delivery',graph:{...graph,states:graph.states.map(s=>({...s,prevent_backtracking:true}))}}
  expect(validateWorkflowInput(input).length).toBeGreaterThan(0)
 })
})
