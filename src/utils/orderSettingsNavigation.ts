import type { NavigationItem } from '../types/NavigationItem'
export function orderSettingsNavigation(items: NavigationItem[], paths: string[]): NavigationItem[] {
 const defaults = ['/settings', '/settings/task-types', '/settings/workflows', '/settings/request-types', '/settings/working-hours', '/settings/integrations', '/settings/accounts', '/settings/analysis-profiles', '/settings/openai', '/settings/oidc', '/settings/email', '/settings/email-template', '/settings/notifications', '/settings/stickers', '/settings/mcp']
 const ordered = [...paths, ...defaults.filter(path => !paths.includes(path))]
 const priority=new Map(ordered.map((path,index)=>[path,index]))
 return items.map(area=>area.id!=='settings'?area:{...area,items:[...area.items].sort((a,b)=>(priority.get(a.path)??ordered.length)-(priority.get(b.path)??ordered.length))})
}
