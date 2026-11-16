import {parseDeveloperWorkflowAssignment} from './parseDeveloperWorkflowAssignment'
export function parseOptionalDeveloperWorkflowAssignment(value:unknown){return value===null?null:parseDeveloperWorkflowAssignment(value)}
