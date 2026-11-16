import {requireRecord} from './requireRecord'
import type {WorkflowStep} from '../types/WorkflowStep'
export function parseWorkflowSteps(value:unknown):WorkflowStep[]{
 if(!Array.isArray(value)||value.length>32)throw Error('Los pasos de la transición no son válidos.')
 return value.map(value=>{
  const step=requireRecord(value)
  const props:Record<string,string[]>={publish_release:[],merge_pull_request:['repository_id','target_branch','target_from_parent'],require_approval:[],advance_state:[],notify:['channel','audience'],verify_push:['repository_id'],create_code_review:['repository_id'],generate_contributor_ratings:['repository_id'],verify_pull_request_merged:['repository_id','target_branch','target_from_parent'],create_branch:['repository_id','base_branch'],verify_pipeline:['repository_id','workflow'],verify_deployment:['repository_id','environment','target_branch','target_from_parent'],handoff:['workflow_id'],create_pull_request:['repository_id','source_branch','target_branch','source_from_task','target_from_parent']}
  if(typeof step.kind!=='string'||!props[step.kind])throw Error('La API devolvió un paso desconocido. Actualiza la aplicación antes de editar este workflow.')
  if(Object.keys(step).some(key=>key!=='kind'&&!props[step.kind as string]!.includes(key)))throw Error('El paso contiene propiedades desconocidas.')
  if(step.repository_id!=null&&(typeof step.repository_id!=='string'||!step.repository_id||step.repository_id.length>128))throw Error('El repositorio del paso no es válido.')
  for(const flag of ['source_from_task','target_from_parent'])if(step[flag]!=null&&typeof step[flag]!=='boolean')throw Error('El selector de rama no es válido.')
  const target=step.target_from_parent?{target_from_parent:true}:{}
  const source=step.source_from_task?{source_from_task:true}:{}
  const repository=typeof step.repository_id==='string'?{repository_id:step.repository_id}:{}
  switch(step.kind){
   case 'require_approval': case 'advance_state':return {kind:step.kind}
   case 'verify_push': case 'create_code_review': case 'generate_contributor_ratings': return {kind:step.kind,...repository}
   case 'publish_release': return {kind:'publish_release'}
   case 'merge_pull_request':
    if(typeof step.target_branch!=='string')throw Error('La rama de destino no es válida.')
    return {kind:step.kind,...repository,...target,target_branch:step.target_branch}
   case 'verify_pull_request_merged':
    if(step.target_branch!=null&&typeof step.target_branch!=='string')throw Error('La rama de destino no es válida.')
    return {kind:step.kind,...repository,...target,...(typeof step.target_branch==='string'?{target_branch:step.target_branch}:{})}
   case 'create_branch':
    if(typeof step.base_branch!=='string')throw Error('La rama base del estado no es válida.')
    return {kind:step.kind,base_branch:step.base_branch,...repository}
   case 'verify_pipeline':
    if(step.workflow!=null&&typeof step.workflow!=='string')throw Error('El workflow de CI no es válido.')
    return {kind:step.kind,...repository,...(typeof step.workflow==='string'?{workflow:step.workflow}:{})}
   case 'verify_deployment':
    if(typeof step.environment!=='string')throw Error('El entorno de despliegue no es válido.')
    if(step.target_branch!=null&&typeof step.target_branch!=='string')throw Error('La rama de destino no es válida.')
    return {kind:step.kind,environment:step.environment,...repository,...target,...(typeof step.target_branch==='string'?{target_branch:step.target_branch}:{})}
   case 'handoff':
    if(typeof step.workflow_id!=='string')throw Error('El workflow de entrega no es válido.')
    return {kind:step.kind,workflow_id:step.workflow_id}
   case 'create_pull_request':
    if(typeof step.source_branch!=='string'||typeof step.target_branch!=='string')throw Error('Las ramas de la PR no son válidas.')
    return {kind:step.kind,source_branch:step.source_branch,target_branch:step.target_branch,...repository,...target,...source}
   case 'notify':
    if(step.channel!=='email'&&step.channel!=='in_app')throw Error('El canal de notificación no es válido.')
    if(step.audience!=null&&step.audience!=='assignee'&&step.audience!=='approvers')throw Error('El destinatario no es válido.')
    return {kind:step.kind,channel:step.channel,...(step.audience?{audience:step.audience as 'assignee'|'approvers'}:{})}
   default:throw Error('Paso desconocido.')
  }
 })
}
