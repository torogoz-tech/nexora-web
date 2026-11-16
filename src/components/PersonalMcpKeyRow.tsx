import { Trash2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { personalMcpKeyStatus } from '../utils/personalMcpKeyStatus'
import type { PersonalMcpKeyRowProps } from '../types/PersonalMcpKeyRowProps'
import IconButton from './IconButton'
export default function PersonalMcpKeyRow({item:key,projects,now,busy,onRevoke}:PersonalMcpKeyRowProps){
 const {t,dateLocale}=useTranslation()
 const status=personalMcpKeyStatus(key,now)
 return <li className="flex min-w-0 items-start gap-3 py-4"><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{key.name}</h3><p className={`mt-1 text-xs ${status === 'Actividad MCP reciente' ? 'text-success' : 'text-base-content/50'}`}>{t(status)}</p>{key.mcp_client_name && <p className="mt-1 break-words text-xs text-base-content/55">{key.mcp_client_name}{key.mcp_client_version ? ` · ${key.mcp_client_version}` : ''}</p>}{key.last_mcp_at && <p className="mt-1 text-xs text-base-content/50">{t('Última actividad MCP')}: <time dateTime={key.last_mcp_at}>{new Date(key.last_mcp_at).toLocaleString(dateLocale)}</time></p>}<p className="mt-1 text-xs text-base-content/45">{t('Vence')}: <time dateTime={key.expires_at}>{new Date(key.expires_at).toLocaleDateString(dateLocale)}</time></p><details className="mt-2 text-xs text-base-content/50"><summary className="cursor-pointer">{t('Ver alcance')}</summary><p className="mt-2 break-words">{key.scope.all_projects ? t('Proyectos y permisos vigentes del miembro') : key.scope.project_ids.map(id => projects.find(project => project.id === id)?.name ?? t('Proyecto no disponible')).join(' · ') || t('Permisos globales')}</p><p className="mt-1 break-words font-mono">{key.scope.capabilities.join(' · ')}</p></details></div>{onRevoke && <IconButton label={t('Revocar clave MCP')} variant="error" disabled={busy} onClick={() => onRevoke(key)}><Trash2 size={15}/></IconButton>}</li>
}
