import { createElement } from 'react'
import { getTaskTypeIcon } from '../utils/getTaskTypeIcon'
import type { TaskTypeGlyphProps } from '../types/TaskTypeGlyphProps'
export default function TaskTypeGlyph({
  code,
  icon,
  color,
  size = 18,
}: TaskTypeGlyphProps) {
  return createElement(getTaskTypeIcon(code, icon), {
    size,
    className: 'shrink-0',
    style: { color: color ?? undefined },
    'aria-hidden': true,
  })
}
