export function getLegacyWorkspacePath(pathname: string): string | null {
  const paths: Record<string, string> = {
    '/': '/profile',
    '/projects': '/settings/projects',
    '/projects/archived': '/settings/projects',
    '/organization/projects': '/settings/projects',
    '/organization/projects/archived': '/settings/projects',
    '/organization': '/settings/members',
    '/organization/members': '/settings/members',
    '/organization/repositories': '/code',
  }
  return Object.hasOwn(paths, pathname) ? paths[pathname] : null
}
