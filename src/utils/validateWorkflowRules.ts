import {validGitBranch} from './validGitBranch'
import type {WorkflowGraph} from '../types/WorkflowGraph'
import {parseWorkflowSteps} from './parseWorkflowSteps'
export function validateWorkflowRules(graph:WorkflowGraph):string[]{
 const errors:string[]=[]
 for(const state of graph.states){
  if(state.progress_order!==undefined&&(!Number.isSafeInteger(state.progress_order)||state.progress_order<0||state.progress_order>65535))errors.push('El orden del estado debe ser un entero entre 0 y 65535.')
  if(state.required_base_branch&&!validGitBranch(state.required_base_branch))errors.push('La rama base del estado no es válida.')
  if(state.prevent_backtracking&&(state.progress_order===undefined||graph.transitions.filter(edge=>edge.from===state.id).some(edge=>{const target=graph.states.find(item=>item.id===edge.to);return target?.progress_order===undefined||target.progress_order<state.progress_order!})))errors.push('Asigna un orden válido al estado y sus destinos para impedir retrocesos.')
 }
 for(const edge of graph.transitions){
  const source=graph.states.find(state=>state.id===edge.from)
  if(edge.automatic&&(!source?.terminal||edge.from!==edge.to))errors.push('El pipeline automático debe permanecer en un estado Fin.')
  if(graph.transitions.filter(item=>item.from===edge.from&&item.automatic).length>1)errors.push('Solo se permite un pipeline automático por estado Fin.')
  const steps=edge.steps??[]
  try{parseWorkflowSteps(steps)}catch{errors.push('Revisa los pasos de la transición.');continue}
  if(!steps.length)continue
  if(steps.filter(step=>step.kind==='require_approval').length>1)errors.push('Solo se permite una aprobación por transición.')
  const advance=steps.findIndex(step=>step.kind==='advance_state')
  if(advance<0||steps.filter(s=>s.kind==='advance_state').length!==1)errors.push('La transición necesita exactamente un paso de cambio de estado.')
  if(steps.some((s,i)=>(s.kind==='handoff'||s.kind==='publish_release')?i<advance||i!==steps.length-1||!edge.automatic:s.kind==='notify'?false:i>advance))errors.push('Las comprobaciones deben preceder al cambio de estado; la entrega debe ser el último paso del pipeline automático.')
  for(const step of steps){
   if(step.kind==='generate_contributor_ratings'&&!steps.slice(0,steps.indexOf(step)).some(prior=>prior.kind==='create_code_review'))errors.push('La valoración necesita un Code Review anterior en la transición.')
   if(step.kind==='merge_pull_request'&&!(edge.guards.some(guard=>guard.kind==='human_approval')||steps.slice(0,steps.indexOf(step)).some(prior=>prior.kind==='require_approval')))errors.push('Integrar la PR requiere una aprobación humana previa.')
   if(step.kind==='merge_pull_request'&&!step.target_from_parent&&!validGitBranch(step.target_branch))errors.push('La rama de destino no es válida.')
   if(step.kind==='publish_release'&&(!(edge.guards.some(guard=>guard.kind==='human_approval')||steps.some(step=>step.kind==='require_approval'))||!steps.some(step=>(step.kind==='verify_pull_request_merged'||step.kind==='merge_pull_request'))||!steps.some(step=>step.kind==='verify_deployment'&&step.environment==='production')))errors.push('Publicar requiere release, revisión, aprobación humana, integración y despliegue en producción.')
   if((step.kind==='verify_pull_request_merged'||step.kind==='merge_pull_request'||step.kind==='verify_deployment')&&step.target_branch&&(step.target_from_parent||!validGitBranch(step.target_branch)))errors.push('La rama de destino no es válida.')
   if(step.kind==='create_branch'&&!validGitBranch(step.base_branch))errors.push('La rama base del estado no es válida.')
   if(step.kind==='verify_deployment'&&!step.environment.trim())errors.push('El entorno de despliegue es obligatorio.')
   if(step.kind==='handoff'&&!step.workflow_id.trim())errors.push('Selecciona el workflow de entrega.')
   if(step.kind==='create_pull_request'&&((step.source_from_task?!!step.source_branch:!validGitBranch(step.source_branch))||(step.target_from_parent?!!step.target_branch:!validGitBranch(step.target_branch))||(!step.source_from_task&&!step.target_from_parent&&step.source_branch===step.target_branch)))errors.push('La PR necesita ramas de origen y destino válidas y distintas.')
  }
 }
 return errors
}
