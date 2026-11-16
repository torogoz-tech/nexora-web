import type { RemoteRepositoryPage } from '../types/RemoteRepositoryPage'
import { requireRecord } from './requireRecord'
export function parseRemoteRepositoryPage(value: unknown): RemoteRepositoryPage {
  const v = requireRecord(value)
  if (!Array.isArray(v.items) || (v.next_page !== null && (!Number.isSafeInteger(v.next_page) || Number(v.next_page) < 2))) throw Error('La página de repositorios no es válida.')
  const items = v.items.map(item => {
    const r = requireRecord(item)
    if (!['github','gitlab'].includes(String(r.provider)) || typeof r.remote_id !== 'string' || !/^[1-9]\d*$/.test(r.remote_id) || typeof r.full_name !== 'string' || !r.full_name.trim()) throw Error('La información del repositorio no es válida.')
    return { provider: r.provider, remote_id: r.remote_id, full_name: r.full_name }
  })
  return { items, next_page: v.next_page } as RemoteRepositoryPage
}
