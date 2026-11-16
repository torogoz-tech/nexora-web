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
  return <div className="overflow-x-auto rounded-xl border border-base-300"><table className="w-full min-w-[48rem] text-left text-sm"><thead className="border-b border-base-300 bg-base-200/40 text-xs text-base-content/60"><tr><th className="px-4 py-3 font-medium">{t('Nombre')}</th><th className="px-4 py-3 font-medium">{t('Cliente')}</th><th className="px-4 py-3 font-medium">{t('Actividad')}</th><th className="px-4 py-3 font-medium">{t('Vigencia')}</th><th className="px-4 py-3 text-right font-medium">{t('Acciones')}</th></tr></thead><tbody className="divide-y divide-base-300">{items.map(key => { const status = personalMcpKeyStatus(key, now); const projectsText = key.scope.all_projects ? t('Proyectos y permisos vigentes del miembro') : key.scope.project_ids.map(id => projects.find(project => project.id === id)?.name ?? t('Proyecto no disponible')).join(' · ') || t('Permisos globales'); return <tr key={key.id} className="align-top hover:bg-base-200/30"><td className="px-4 py-3"><strong className="block break-words">{key.name}</strong><span className={`mt-1 block text-xs ${status === 'Actividad MCP reciente' ? 'text-success' : 'text-base-content/50'}`}>{t(status)}</span><span className="mt-1 block max-w-64 break-words text-xs text-base-content/45">{projectsText}</span></td><td className="px-4 py-3 text-xs text-base-content/60">{key.mcp_client_name ? `${key.mcp_client_name}${key.mcp_client_version ? ` · ${key.mcp_client_version}` : ''}` : t('Sin cliente identificado')}</td><td className="px-4 py-3 text-xs text-base-content/60">{key.last_mcp_at ? <time dateTime={key.last_mcp_at}>{new Date(key.last_mcp_at).toLocaleString(dateLocale)}</time> : t('Sin actividad MCP')}</td><td className="px-4 py-3 text-xs text-base-content/60"><time dateTime={key.expires_at}>{new Date(key.expires_at).toLocaleDateString(dateLocale)}</time></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><IconButton label={t('Copiar alcance MCP')} disabled={busy} onClick={() => onCopyScope(key)}><Copy size={15}/></IconButton><IconButton label={t('Revocar clave MCP')} variant="error" disabled={busy} onClick={() => onRevoke(key)}><Trash2 size={15}/></IconButton></div></td></tr> })}</tbody></table></div>
}
