import {parseDeveloperWorkflowAssignment} from './parseDeveloperWorkflowAssignment'
export function parseDeveloperWorkflowAssignments(value:unknown){
 if(!Array.isArray(value))throw Error('Las asignaciones de workflows no son válidas.')
 return value.map(parseDeveloperWorkflowAssignment)
}
