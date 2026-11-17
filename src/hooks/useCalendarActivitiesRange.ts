import { useEffect, useState } from 'react'
import { readApiJson } from '../services/readApiJson'
import { parseCalendarActivities } from '../utils/parseCalendarActivities'
import type { CalendarActivity } from '../types/CalendarActivity'

const day = (value: string) => new Date(`${value}T12:00:00Z`)
const iso = (value: Date) => value.toISOString().slice(0, 10)

function ranges(from: string, to: string) {
  const result: Array<[string, string]> = []
  let cursor = day(from)
  const end = day(to)
  while (cursor < end) {
    const next = new Date(cursor)
    next.setUTCDate(next.getUTCDate() + 62)
    result.push([iso(cursor), iso(next < end ? next : end)])
    cursor = next
  }
  return result
}

export function useCalendarActivitiesRange(from: string | null, to: string | null) {
  const key = from && to ? `${from}:${to}` : ''
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ key: string; items: CalendarActivity[]; error: string | null }>({ key: '', items: [], error: null })
  useEffect(() => {
    if (!from || !to) return
    const controller = new AbortController()
    void Promise.all(ranges(from, to).map(async ([start, end]) => {
      const page = parseCalendarActivities(await readApiJson(`/api/v1/calendar/activities?from=${start}&to=${end}&limit=100`, controller.signal))
      return page.items
    })).then(pages => {
      if (!controller.signal.aborted) {
        const items = pages.flat().filter((item, index, all) => all.findIndex(candidate => candidate.id === item.id) === index)
        setState({ key, items, error: null })
      }
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, items: [], error: error instanceof Error ? error.message : 'No pudimos consultar el calendario.' })
    })
    return () => controller.abort()
  }, [from, to, key, attempt])
  return { items: state.key === key ? state.items : [], error: state.key === key ? state.error : null, loading: Boolean(key) && state.key !== key, reload: () => setAttempt(value => value + 1) }
}
