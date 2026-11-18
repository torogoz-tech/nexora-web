import {requireRecord} from './requireRecord'
import type {TaskTransitionRun} from '../types/TaskTransitionRun'
export function parseTaskTransitionRuns(value:unknown):TaskTransitionRun[]{
 const page=requireRecord(value)
 if(!Array.isArray(page.items))throw Error('Las ejecuciones de la transición no son válidas.')
 return page.items.map(value=>{
  const run=requireRecord(value)
  if(!['id','task_id','transition_id'].every(k=>typeof run[k]==='string')||!Number.isSafeInteger(run.task_revision)||!Number.isSafeInteger(run.next_step)||typeof run.advanced!=='boolean'||!Array.isArray(run.outcomes)||!['ready','running','waiting_approval','waiting_external','waiting_knowledge','failed','succeeded'].includes(String(run.status)))throw Error('La ejecución de la transición no es válida.')
  return run as TaskTransitionRun
 })
}
