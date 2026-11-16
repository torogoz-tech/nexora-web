import { apiFetch } from './apiFetch'

const avatars = new Map<string, { revision?: number; url?: string; request: Promise<string | undefined> }>()
let generation = 0
let listening = false

export function clearMemberAvatarCache() {
 generation++
 for (const avatar of avatars.values()) if (avatar.url) URL.revokeObjectURL(avatar.url)
 avatars.clear()
}

export function readMemberAvatar(actorId: string, revision?: number): Promise<string | undefined> {
 if (!listening && typeof window !== 'undefined') {
  listening = true
  window.addEventListener('nexora:avatar-changed', event => {
   const id = (event as CustomEvent<{ actorId: string }>).detail?.actorId
   if (!id) return
   const old = avatars.get(id)
   avatars.delete(id)
   if (old?.url) window.setTimeout(() => URL.revokeObjectURL(old.url!), 30000)
  })
 }
 const previous = avatars.get(actorId)
 if (previous && (revision === undefined || previous.revision === undefined || revision <= previous.revision)) {
  if (revision !== undefined && previous.revision === undefined) previous.revision = revision
  return previous.request
 }
 const currentGeneration = generation
 const entry: { revision?: number; url?: string; request: Promise<string | undefined> } = {
  revision, request: Promise.resolve(undefined),
 }
 entry.request = (revision === 0 ? Promise.resolve(undefined) : apiFetch(`/api/v1/members/${encodeURIComponent(actorId)}/avatar`)
  .then(async response => {
   if (!response.ok || response.headers.get('Content-Type')?.split(';')[0] !== 'image/png') return
   const blob = await response.blob()
   if (generation !== currentGeneration || avatars.get(actorId) !== entry || !blob.size || blob.size > 2 * 1024 * 1024) return
   entry.url = URL.createObjectURL(blob)
   return entry.url
  })).catch(() => {
   // Retry transport failures on the next mount; absent photos stay cached.
   if (avatars.get(actorId) === entry) avatars.delete(actorId)
   return undefined
  })
 avatars.set(actorId, entry)
 // Keep the old URL alive while mounted consumers switch to the new revision.
 if (previous?.url) window.setTimeout(() => URL.revokeObjectURL(previous.url!), 30000)
 return entry.request
}
