import { useEffect, useRef, useState } from 'react'
import { getProjects } from '../services/getProjects'
import type { Project } from '../types/Project'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [cursor, setCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const nextRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getProjects(controller.signal, true)
      .then((page) => {
        setProjects(page.items)
        setCursor(page.next_cursor)
        setStatus('ready')
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setStatus(error instanceof Error ? error.message : 'request-failed')
      })
    return () => {
      controller.abort()
      nextRequest.current?.abort()
    }
  }, [attempt])

  function retry() {
    nextRequest.current?.abort()
    nextRequest.current = null
    setLoadingMore(false)
    setPageError(null)
    setStatus('loading')
    setAttempt((value) => value + 1)
  }
  async function loadMore() {
    if (!cursor || nextRequest.current) return
    const controller = new AbortController()
    nextRequest.current = controller
    setLoadingMore(true)
    setPageError(null)
    try {
      const page = await getProjects(controller.signal, true, cursor)
      if (controller.signal.aborted) return
      setProjects((previous) => {
        const merged = new Map(previous.map((project) => [project.id, project]))
        page.items.forEach((project) => {
          const existing = merged.get(project.id)
          if (!existing || existing.revision < project.revision)
            merged.set(project.id, project)
        })
        return [...merged.values()]
      })
      setCursor(page.next_cursor)
    } catch {
      if (!controller.signal.aborted)
        setPageError('No pudimos cargar más proyectos. Vuelve a intentarlo.')
    } finally {
      if (nextRequest.current === controller) {
        nextRequest.current = null
        setLoadingMore(false)
      }
    }
  }
  function addProject(project: Project) {
    setProjects((previous) =>
      previous.some((item) => item.id === project.id)
        ? previous.map((item) => (item.id === project.id ? project : item))
        : [project, ...previous],
    )
    setStatus('ready')
  }
  return {
    projects,
    status,
    hasMore: cursor !== null,
    retry,
    addProject,
    loadMore,
    loadingMore,
    pageError,
  }
}
