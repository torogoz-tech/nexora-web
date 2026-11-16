import { taskReturnPath } from './taskReturnPath'
export function taskDetailPath(id: string, returnTo = '/tasks') {
  return `/tasks/${encodeURIComponent(id)}?${new URLSearchParams({ returnTo: taskReturnPath(returnTo) })}`
}
