import {requireRecord} from './requireRecord'
import type {TaskStageCompletion} from '../types/TaskStageCompletion'
export function parseTaskStageCompletions(value:unknown):TaskStageCompletion[]{
 if(!Array.isArray(value))throw Error('El historial de etapas no es válido.')
 return value.map(value=>{const row=requireRecord(value);if(!['task_id','workflow_version_id','state_id','completed_at'].every(key=>typeof row[key]==='string'&&!!row[key])||!Number.isSafeInteger(row.task_revision)||Number(row.task_revision)<1||!Number.isFinite(Date.parse(String(row.completed_at))))throw Error('El historial de etapas no es válido.');return row as TaskStageCompletion})
}
