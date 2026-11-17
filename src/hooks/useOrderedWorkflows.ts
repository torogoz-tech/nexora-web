import { useEffect, useMemo, useState } from 'react'
import type { WorkflowSummary } from '../types/WorkflowSummary'

const storageKey = 'nexora:boards-order'

function readOrder() {
  if (typeof window === 'undefined') return []
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function useOrderedWorkflows(workflows: WorkflowSummary[]) {
  const [order, setOrder] = useState<string[]>(readOrder)
  const ids = useMemo(() => workflows.map(workflow => workflow.id), [workflows])
  const normalizedOrder = useMemo(
    () => [...order.filter(id => ids.includes(id)), ...ids.filter(id => !order.includes(id))],
    [ids, order],
  )
  useEffect(() => { window.localStorage.setItem(storageKey, JSON.stringify(normalizedOrder)) }, [normalizedOrder])
  const items = useMemo(() => [...workflows].sort((a, b) => normalizedOrder.indexOf(a.id) - normalizedOrder.indexOf(b.id)), [workflows, normalizedOrder])
  const move = (id: string, direction: -1 | 1) => setOrder(() => {
    const index = normalizedOrder.indexOf(id), target = index + direction
    if (index < 0 || target < 0 || target >= normalizedOrder.length) return normalizedOrder
    const next = [...normalizedOrder]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    return next
  })
  return { items, move }
}
