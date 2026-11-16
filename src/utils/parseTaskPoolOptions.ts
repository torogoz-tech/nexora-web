import { requireRecord } from './requireRecord'
import type { TaskPoolOptions } from '../types/TaskPoolOptions'
export function parseTaskPoolOptions(value: unknown): TaskPoolOptions {
  const data = requireRecord(value)
  if (!Array.isArray(data.types) || !Array.isArray(data.assignees)) throw Error('Las opciones de tarea no son válidas.')
  return {
    workflows: Array.isArray(data.workflows) ? data.workflows.map(value => { const item=requireRecord(value); if(typeof item.id!=='string'||typeof item.name!=='string'||!Array.isArray(item.assignee_ids)) throw Error('Workflow inválido.'); return {id:item.id,name:item.name,assignee_ids:item.assignee_ids.filter((id):id is string=>typeof id==='string')} }) : [],
    types: data.types.map(value => {
      const item = requireRecord(value)
      if (typeof item.code !== 'string' || typeof item.name !== 'string') throw Error('El tipo de tarea no es válido.')
      return { code: item.code, name: item.name, purpose: (item.purpose==='product_design'||item.purpose==='implementation'?item.purpose:'general'), ...(typeof item.icon==='string'?{icon:item.icon}:{}) }
    }),
    assignees: data.assignees.map(value => {
      const item = requireRecord(value)
      if (typeof item.actor_id !== 'string' || typeof item.name !== 'string') throw Error('El responsable no es válido.')
      return { actor_id: item.actor_id, name: item.name }
    }),
  }
}
