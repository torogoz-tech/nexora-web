import { parseDeveloperWorkflowAssignment } from './parseDeveloperWorkflowAssignment'
export function parseOptionalDeveloperWorkflow(value: unknown) {
  return value === null ? null : parseDeveloperWorkflowAssignment(value)
}
