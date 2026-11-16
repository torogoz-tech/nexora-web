import { getContainedLogoBounds } from './getContainedLogoBounds'
/** Decode raster content rather than trusting an optional browser MIME type. */
export async function prepareRasterImage(file: File, signal: AbortSignal, cover = false) {
  if (file.size > 2097152) throw Error('La imagen supera el límite de 2 MB.')
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  const webp =
    [82, 73, 70, 70].every((v, i) => bytes[i] === v) &&
    [87, 69, 66, 80].every((v, i) => bytes[i + 8] === v)
  if (!png && !jpeg && !webp)
    throw Error('El archivo debe ser una imagen PNG, JPEG o WebP.')
  signal.throwIfAborted()
  let image: ImageBitmap
  try {
    image = await createImageBitmap(file)
  } catch {
    throw Error(
      'No pudimos leer la imagen. Comprueba que el archivo no esté dañado.',
    )
  }
  try {
    signal.throwIfAborted()
    const contained = getContainedLogoBounds(image.width, image.height)
    const scale = 512 / Math.min(image.width, image.height)
    const bounds = cover ? { x: (512 - image.width * scale) / 2, y: (512 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale } : contained
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context)
      throw Error('No pudimos preparar la imagen. Vuelve a intentarlo.')
    context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height)
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(
                Error('No pudimos preparar la imagen. Vuelve a intentarlo.'),
              ),
        'image/png',
      ),
    )
    signal.throwIfAborted()
    const data = new Uint8Array(await blob.arrayBuffer())
    const chunks: string[] = []
    for (let offset = 0; offset < data.length; offset += 32768)
      chunks.push(String.fromCharCode(...data.subarray(offset, offset + 32768)))
    return btoa(chunks.join(''))
  } finally {
    image.close()
  }
}
