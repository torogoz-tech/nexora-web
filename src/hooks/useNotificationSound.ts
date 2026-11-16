import { useEffect, useRef } from 'react'
import type { NotificationInboxPage } from '../types/NotificationInboxPage'
import { playNotificationSound } from '../services/playNotificationSound'

export function useNotificationSound(page: NotificationInboxPage | null) {
  const audio = useRef<AudioContext | null>(null)
  const latest = useRef<{ time: number; ids: Set<string> } | null>(null)

  useEffect(() => {
    const activate = () => {
      if (!window.AudioContext) return
      try {
        audio.current ??= new AudioContext()
        if (audio.current.state === 'suspended') void audio.current.resume().catch(() => {})
      } catch { /* The unread indicator remains available if audio is blocked. */ }
    }
    window.addEventListener('click', activate)
    window.addEventListener('keydown', activate)
    return () => {
      window.removeEventListener('click', activate)
      window.removeEventListener('keydown', activate)
      void audio.current?.close().catch(() => {})
      audio.current = null
    }
  }, [])

  useEffect(() => {
    if (!page) return
    const previous = latest.current
    let time = previous?.time ?? -Infinity
    const ids = new Set(previous?.ids)
    let arrived = false
    for (const item of page.items) {
      const created = Date.parse(item.created_at)
      if (!Number.isFinite(created) || created < time) continue
      if (created > time) { time = created; ids.clear() }
      if (!ids.has(item.id)) {
        if (previous && (created > previous.time || !previous.ids.has(item.id)) && !item.read_at) arrived = true
        ids.add(item.id)
      }
    }
    latest.current = { time, ids }
    if (arrived && audio.current?.state === 'running') playNotificationSound(audio.current)
  }, [page])
}
