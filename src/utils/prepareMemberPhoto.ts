import { prepareRasterImage } from './prepareRasterImage'
export function prepareMemberPhoto(file: File, signal: AbortSignal) {
  return prepareRasterImage(file, signal, true)
}
