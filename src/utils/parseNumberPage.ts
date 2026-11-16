import { requireRecord } from './requireRecord'
import type { NumberPage } from '../types/NumberPage'
export function parseNumberPage<T>(
  value: unknown,
  parseItem: (item: unknown) => T,
): NumberPage<T> {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    !Number.isSafeInteger(v.page) ||
    Number(v.page) < 1 ||
    (v.next_page !== null &&
      (!Number.isSafeInteger(v.next_page) ||
        Number(v.next_page) <= Number(v.page)))
  )
    throw new Error('La página de resultados no es válida.')
  return {
    items: v.items.map(parseItem),
    next_page: v.next_page as number | null,
    page: v.page as number,
  }
}
