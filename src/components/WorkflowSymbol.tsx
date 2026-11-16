import { getWorkflowIcon } from '../utils/getWorkflowIcon'
import { createElement } from 'react'
import type { WorkflowIcon } from '../types/WorkflowIcon'
export default function WorkflowSymbol({ icon, size = 20, className, color }: { icon?: WorkflowIcon; size?: number; className?: string; color?: string }) {
  return createElement(getWorkflowIcon(icon), { size, className, style: { color }, 'aria-hidden': true })
}
