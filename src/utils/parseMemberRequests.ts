import type { MemberRequest } from '../types/MemberRequest'

export function parseMemberRequests(value: unknown): MemberRequest[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { items?: unknown }).items)) throw Error('invalid-response')
  return (value as { items: unknown[] }).items.map(item => {
    if (!item || typeof item !== 'object') throw Error('invalid-response')
    const request = item as Record<string, unknown>
    if (typeof request.id !== 'string' || typeof request.kind !== 'string' || typeof request.name !== 'string' || typeof request.email !== 'string' || typeof request.created_at !== 'string') throw Error('invalid-response')
    return { id: request.id, kind: request.kind as MemberRequest['kind'], name: request.name, email: request.email, created_at: request.created_at, expires_at: typeof request.expires_at === 'string' ? request.expires_at : undefined, status: typeof request.status === 'string' ? request.status : undefined, role: (request.role ?? null) as MemberRequest['role'] }
  })
}
