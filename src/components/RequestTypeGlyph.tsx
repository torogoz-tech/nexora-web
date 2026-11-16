import WorkflowSymbol from './WorkflowSymbol'
import type { WorkflowIcon } from '../types/WorkflowIcon'
export default function RequestTypeGlyph({ icon, color, size = 18 }: { icon?: WorkflowIcon; color?: string; size?: number }) {
  return <WorkflowSymbol icon={icon ?? 'headset'} color={color ?? '#38BDF8'} size={size} className="shrink-0"/>
}
