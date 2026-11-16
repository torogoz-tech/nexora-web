import { workflowIcons } from '../app/workflowIcons'
export function getWorkflowIcon(value: unknown) {
  return (workflowIcons.find(option => option.value === value) ?? workflowIcons.find(option => option.value === 'workflow')!).icon
}
