import { prepareRasterImage } from './prepareRasterImage'
export function prepareOrganizationLogo(file: File, signal: AbortSignal) {
  return prepareRasterImage(file, signal)
}
