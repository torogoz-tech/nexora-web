import {describe,it,expect} from 'vitest'
import {parseWorkflowSteps} from '../utils/parseWorkflowSteps'
import {parseWorkflowGraph} from '../utils/parseWorkflowGraph'
import {validateWorkflowRules} from '../utils/validateWorkflowRules'
import {workflowStepOrderValid} from '../utils/workflowStepOrderValid'
import type {WorkflowGraph} from '../types/WorkflowGraph'
describe('final workflow pipelines',()=>{
 const steps=parseWorkflowSteps([{kind:'create_branch',base_branch:'develop'},{kind:'create_code_review'},{kind:'verify_pipeline',workflow:'ci.yml'},{kind:'verify_pull_request_merged',target_branch:'develop'},{kind:'verify_deployment',environment:'production',target_branch:'release'},{kind:'advance_state'},{kind:'notify',channel:'in_app'},{kind:'handoff',workflow_id:'next'}])
 const graph:WorkflowGraph={states:[{id:'done',name:'Fin',terminal:true}],transitions:[{id:'final',name:'Publish',from:'done',to:'done',guards:[],steps,automatic:true}]}
 it('preserves all configured delivery properties and automatic final execution',()=>{
  expect(parseWorkflowGraph(graph).transitions[0]).toEqual(graph.transitions[0])
  expect(validateWorkflowRules(graph)).toEqual([])
  expect(workflowStepOrderValid(steps)).toBe(true)
 })
 it('rejects automatic execution outside a terminal self-loop',()=>{
  expect(validateWorkflowRules({...graph,states:[{id:'done',name:'Working'}]})).toContain('El pipeline automático debe permanecer en un estado Fin.')
 })
 it('allows handoff only last and after state advancement in an automatic pipeline',()=>{
  expect(workflowStepOrderValid([{kind:'handoff',workflow_id:'next'},{kind:'advance_state'}])).toBe(false)
  expect(validateWorkflowRules({...graph,transitions:[{...graph.transitions[0]!,automatic:false}]})).not.toEqual([])
 })
 it('requires approval before provider merge',()=>{
  const unapproved={...graph,transitions:[{...graph.transitions[0]!,steps:[{kind:'merge_pull_request' as const,target_branch:'develop'},{kind:'advance_state' as const}]}]}
  expect(validateWorkflowRules(unapproved)).toContain('Integrar la PR requiere una aprobación humana previa.')
  expect(validateWorkflowRules({...unapproved,transitions:[{...unapproved.transitions[0]!,guards:[{kind:'human_approval'}]}]})).toEqual([])
 })
 it('parses explicit release publication and provider merge properties',()=>{
  expect(parseWorkflowSteps([{kind:'merge_pull_request',target_branch:'develop'},{kind:'publish_release'}])).toEqual([{kind:'merge_pull_request',target_branch:'develop'},{kind:'publish_release'}])
  expect(()=>parseWorkflowSteps([{kind:'merge_pull_request'}])).toThrow()
 })
 it('rejects empty deployment environment and duplicate final pipelines',()=>{
  expect(validateWorkflowRules({...graph,transitions:[{...graph.transitions[0]!,steps:[{kind:'verify_deployment',environment:''},{kind:'advance_state'}]},graph.transitions[0]!]})).toContain('El entorno de despliegue es obligatorio.')
 })
})

it('conserva los selectores de ramas verificadas para integrar subtareas sin nombres fijos',()=>{
 const steps=parseWorkflowSteps([{kind:'create_code_review'},{kind:'create_pull_request',source_branch:'',source_from_task:true,target_branch:'',target_from_parent:true},{kind:'require_approval'},{kind:'merge_pull_request',target_branch:'',target_from_parent:true},{kind:'advance_state'}])
 expect(steps[1]).toMatchObject({source_from_task:true,target_from_parent:true})
 expect(validateWorkflowRules({states:[{id:'ready',name:'Ready',initial:true},{id:'done',name:'Done',terminal:true}],transitions:[{id:'finish',name:'Finish',from:'ready',to:'done',guards:[],steps}]})).toEqual([])
 expect(()=>parseWorkflowSteps([{kind:'verify_deployment',environment:'qa',target_from_parent:'yes'}])).toThrow()
})
