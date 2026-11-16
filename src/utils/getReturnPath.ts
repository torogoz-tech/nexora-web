import { getLegacyWorkspacePath } from './getLegacyWorkspacePath'
import { navigation } from '../app/navigation'
export function getReturnPath(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    value.includes('#')
  )
    return '/profile'
  const url = new URL(value, 'https://nexora.local')
  const legacy = getLegacyWorkspacePath(url.pathname)
  if (url.origin === 'https://nexora.local' && legacy)
    return legacy + url.search
  return url.origin === 'https://nexora.local' &&
    (url.pathname === '/tasks/board' ||
      url.pathname === '/profile/mcp-history' ||
      url.pathname === '/settings/mcp/history' ||
      url.pathname === '/settings/members' ||
      url.pathname === '/settings/projects' ||
      url.pathname === '/settings/products' ||
      url.pathname === '/settings/labor-calendar' ||
      url.pathname === '/settings/labor-calendar/history' ||
      url.pathname === '/settings/task-types/new' ||
      /^\/settings\/task-types\/[a-z0-9_-]+\/edit$/.test(url.pathname) ||
      /^\/settings\/members\/[A-Za-z0-9_-]+$/.test(url.pathname) ||
      /^\/settings\/analysis-profiles\/[A-Za-z0-9_-]+$/.test(url.pathname) ||
      /^\/boards\/[A-Za-z0-9_-]+$/.test(url.pathname) ||
      /^\/code\/pull-requests\/[1-9]\d*$/.test(url.pathname) ||
      /^\/settings\/workflows\/[A-Za-z0-9_-]+(?:\/versions)?$/.test(
        url.pathname,
      ) ||
      navigation.some((section) =>
        section.items.some((item) => item.path === url.pathname),
      ))
    ? url.pathname + url.search
    : '/profile'
}
