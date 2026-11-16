import { parseDeveloperWorkflowAssignment } from './parseDeveloperWorkflowAssignment'
export function parseDeveloperWorkflowMembers(value: unknown) {
  if (!Array.isArray(value))
    throw Error('La lista de desarrolladores no es válida.')
  return value.map(parseDeveloperWorkflowAssignment)
}
