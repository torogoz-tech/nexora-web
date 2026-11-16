import { useEffect, useState } from 'react'
import { readMemberAvatar } from '../services/memberAvatarCache'
export function useMemberAvatar(actorId: string | undefined, revision?: number) {
 const [changedRevision, setChangedRevision] = useState<number>()
 const effectiveRevision = Math.max(revision ?? -1, changedRevision ?? -1)
 const [image, setImage] = useState<{ actorId: string; url?: string } | null>(null)
 useEffect(() => {
  const listener = (event: Event) => {
   if (event instanceof CustomEvent && event.detail?.actorId === actorId) setChangedRevision(event.detail.revision)
  }
  window.addEventListener('nexora:avatar-changed', listener)
  return () => window.removeEventListener('nexora:avatar-changed', listener)
 }, [actorId])
 useEffect(() => {
  if (!actorId) return
  let active = true
  void readMemberAvatar(actorId, effectiveRevision < 0 ? undefined : effectiveRevision).then(url => {
   if (active) setImage({ actorId, url })
  })
  return () => { active = false }
 }, [actorId, effectiveRevision])
 return image && image.actorId === actorId ? image.url : undefined
}
