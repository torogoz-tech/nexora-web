import { Copy, Trash2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { personalMcpKeyStatus } from '../utils/personalMcpKeyStatus'
import type { PersonalMcpKeyMetadata } from '../types/PersonalMcpKeyMetadata'
import IconButton from './IconButton'

type PersonalMcpKeyTableProps = {
  items: PersonalMcpKeyMetadata[]
  projects: { id: string; name: string }[]
  now: string
  busy?: boolean
  onRevoke: (item: PersonalMcpKeyMetadata) => void
  onCopyScope: (item: PersonalMcpKeyMetadata) => void
}

export default function PersonalMcpKeyTable({ items, projects, now, busy, onRevoke, onCopyScope }: PersonalMcpKeyTableProps) {
  const { t, dateLocale } = useTranslation()
  return <div className="w-full overflow-hidden rounded-xl border border-base-300"><table className="w-full table-fixed text-left text-xs sm:text-sm"><colgroup><col/><col className="w-[5.5rem] sm:w-[8rem]"/><col className="w-[5.5rem] sm:w-[7rem]"/><col className="w-[5rem] sm:w-[6rem]"/></colgroup><thead className="border-b border-base-300 bg-base-200/40 text-[.7rem] text-base-content/60"><tr><th className="px-2 py-2 font-medium sm:px-4 sm:py-3">{t('Clave')}</th><th className="px-2 py-2 font-medium sm:px-4 sm:py-3">{t('Actividad')}</th><th className="px-2 py-2 font-medium sm:px-4 sm:py-3">{t('Vence')}</th><th className="px-2 py-2 text-right font-medium sm:px-4 sm:py-3">{t('Acciones')}</th></tr></thead><tbody className="divide-y divide-base-300">{items.map(key => { const status = personalMcpKeyStatus(key, now); const projectsText = key.scope.all_projects ? t('Proyectos y permisos vigentes del miembro') : key.scope.project_ids.map(id => projects.find(project => project.id === id)?.name ?? t('Proyecto no disponible')).join(' · ') || t('Permisos globales'); return <tr key={key.id} className="align-top hover:bg-base-200/30"><td className="min-w-0 px-2 py-2 sm:px-4 sm:py-3"><strong className="block truncate font-medium" title={key.name}>{key.name}</strong><span className={`mt-1 block truncate text-[.7rem] ${status === 'Actividad MCP reciente' ? 'text-success' : 'text-base-content/50'}`}>{t(status)}</span><span className="mt-1 block truncate text-[.7rem] text-base-content/45" title={projectsText}>{projectsText}</span><span className="mt-1 block truncate text-[.7rem] text-base-content/45" title={key.mcp_client_name ? `${key.mcp_client_name}${key.mcp_client_version ? ` · ${key.mcp_client_version}` : ''}` : t('Sin cliente identificado')}>{key.mcp_client_name ? `${key.mcp_client_name}${key.mcp_client_version ? ` · ${key.mcp_client_version}` : ''}` : t('Sin cliente identificado')}</span></td><td className="truncate px-2 py-2 text-[.7rem] text-base-content/60 sm:px-4 sm:py-3">{key.last_mcp_at ? <time dateTime={key.last_mcp_at}>{new Date(key.last_mcp_at).toLocaleDateString(dateLocale)}</time> : '—'}</td><td className="truncate px-2 py-2 text-[.7rem] text-base-content/60 sm:px-4 sm:py-3"><time dateTime={key.expires_at}>{new Date(key.expires_at).toLocaleDateString(dateLocale)}</time></td><td className="px-1 py-2 sm:px-3 sm:py-3"><div className="flex justify-end gap-0 sm:gap-1"><IconButton label={t('Copiar alcance MCP')} disabled={busy} onClick={() => onCopyScope(key)}><Copy size={14}/></IconButton><IconButton label={t('Revocar clave MCP')} variant="error" disabled={busy} onClick={() => onRevoke(key)}><Trash2 size={14}/></IconButton></div></td></tr> })}</tbody></table></div>
}
