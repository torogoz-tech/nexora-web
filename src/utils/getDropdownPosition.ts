export function getDropdownPosition(
  rect: Pick<DOMRect, 'left' | 'top' | 'bottom' | 'width'>,
  viewportWidth: number,
  viewportHeight: number,
  contentHeight: number,
) {
  const width = Math.min(Math.max(rect.width, 220), viewportWidth - 16)
  const below = viewportHeight - rect.bottom - 12
  const above = rect.top - 12
  const upwards = below < Math.min(contentHeight, 180) && above > below
  const maxHeight = Math.max(40, Math.min(240, upwards ? above : below))
  const height = Math.min(contentHeight, maxHeight)
  return {
    position: 'fixed' as const,
    right: 'auto',
    bottom: 'auto',
    left: Math.max(8, Math.min(rect.left, viewportWidth - width - 8)),
    top: upwards ? Math.max(8, rect.top - height - 4) : rect.bottom + 4,
    width,
    maxHeight,
  }
}
