import {parseTaskDetails} from '../utils/parseTaskDetails'
import {parseDeveloperBoardPage} from '../utils/parseDeveloperBoardPage'
import {parseVisibleTaskPage} from '../utils/parseVisibleTaskPage'
import {parseTaskStageCompletions} from '../utils/parseTaskStageCompletions'
import {describe,it,expect} from 'vitest'
import {parseTaskPoolOptions} from '../utils/parseTaskPoolOptions'
import {prepareBoardTaskInput} from '../utils/prepareBoardTaskInput'
import {parsePrimaryKnowledgeOptions} from '../utils/parsePrimaryKnowledgeOptions'
describe('task purpose contracts',()=>{
 it('accepts General active and completed work without workflow or state in every task parser',()=>{
  for(const lifecycle of ['active','completed']){
   const task={id:'task',title:'General work',context:'',created_by:'member',project_id:null,project_name:null,workflow_id:null,workflow_version_id:null,state_id:null,assignee_id:'member',priority:'medium',blocked:false,revision:2,purpose:'general',lifecycle,type_code:'custom',type_name:'General',updated_at:'2026-11-11T12:00:00Z',archived:false,assignee_name:'Member',state_name:null}
   expect(parseTaskDetails(task).workflow_id).toBeNull()
   expect(parseDeveloperBoardPage({items:[task],next_after:null}).items[0]?.state_id).toBeNull()
   expect(parseVisibleTaskPage({items:[task],next_after:null,total:1}).items[0]?.workflow_id).toBeNull()
   expect(()=>parseTaskDetails({...task,purpose:'implementation'})).toThrow()
  }
 })
 it('requires the exact tested repository and full SHA for corrective children',()=>{
  const input={title:'Correction',context:'',typeCode:'custom',priority:'medium' as const,projectId:'project',subtaskWork:{workKind:'corrective' as const,testedRepositoryId:'repo',testedCommitSha:'abc'}}
  expect(()=>prepareBoardTaskInput(input)).toThrow()
  expect(prepareBoardTaskInput({...input,subtaskWork:{...input.subtaskWork,testedCommitSha:'a'.repeat(40)}}).subtaskWork?.testedCommitSha).toBe('a'.repeat(40))
 })
 it('keeps stage completion independent of global completion',()=>{
  const stages=parseTaskStageCompletions([{task_id:'task',workflow_version_id:'version',state_id:'done',task_revision:7,completed_at:'2026-11-11T12:00:00Z'}])
  expect(stages[0]?.task_revision).toBe(7)
  expect(stages[0]).not.toHaveProperty('lifecycle')
 })
 it('preserves stable purposes and entry workflow eligibility',()=>{
  const options=parseTaskPoolOptions({types:[{code:'editable-code',name:'Custom design',purpose:'product_design'}],assignees:[],workflows:[{id:'flow',name:'Design',assignee_ids:['member']}]})
  expect(options.types[0].purpose).toBe('product_design')
  expect(options.workflows?.[0].assignee_ids).toEqual(['member'])
 })
 it('preserves optional primary knowledge and entry workflow in creation input',()=>{
  const input=prepareBoardTaskInput({title:' Checkout ',context:'',typeCode:'custom',priority:'medium',entryWorkflowId:'flow',primaryRequirementId:'requirement'})
  expect(input.entryWorkflowId).toBe('flow')
  expect(input.primaryRequirementId).toBe('requirement')
  expect(input.primaryFeatureId).toBeUndefined()
 })
 it('selects primary knowledge by human readable names',()=>{
  expect(parsePrimaryKnowledgeOptions({items:[{id:'requirement',title:'Checkout requirement',archived:false}],next_after:'next'})).toEqual({items:[{id:'requirement',name:'Checkout requirement',archived:false}],next_after:'next'})
 })
})
