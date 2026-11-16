export function getContainedLogoBounds(width: number, height: number) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1 ||
    width > 4096 ||
    height > 4096
  )
    throw Error('La imagen debe tener entre 1 y 4096 píxeles por lado.')
  const scale = Math.min(512 / width, 512 / height),
    w = Math.max(1, Math.round(width * scale)),
    h = Math.max(1, Math.round(height * scale))
  return {
    x: Math.floor((512 - w) / 2),
    y: Math.floor((512 - h) / 2),
    width: w,
    height: h,
  }
}
