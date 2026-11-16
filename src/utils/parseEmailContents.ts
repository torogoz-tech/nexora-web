import { parseEmailContent } from './parseEmailContent'
export function parseEmailContents(value: unknown) {
  if (!Array.isArray(value)) throw Error('La configuración recibida no es válida.')
  return value.map(parseEmailContent)
}
