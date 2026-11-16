import { useContext } from 'react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Check, Copy, History, KeyRound, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { parsePersonalMcpKeys } from '../utils/parsePersonalMcpKeys'
import { isPersonalMcpKeyInactive } from '../utils/isPersonalMcpKeyInactive'
import PersonalMcpKeyTable from '../components/PersonalMcpKeyTable'
import RowAction from '../components/RowAction'
import { createPersonalMcpKey } from '../services/createPersonalMcpKey'
import { revokePersonalMcpKey } from '../services/revokePersonalMcpKey'
import type { PersonalMcpKeyMetadata } from '../types/PersonalMcpKeyMetadata'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import TextButton from '../components/TextButton'
import Dropdown from '../components/Dropdown'
import IntegrationDialog from '../components/IntegrationDialog'
import Pagination from '../components/Pagination'
import { useUrlCursorPagination } from '../hooks/useUrlCursorPagination'
const JsonCodeViewer = lazy(() => import('../components/JsonCodeViewer'))

/** Personal access only. The server always resolves the current human session. */
export default function McpSettingsPage() {
 const access=useContext(WorkspacePermissionsContext);const requestsOnly=access?.role==='user'||access?.role==='supervisor'
 const { t } = useTranslation()
 const paging = useUrlCursorPagination()
 const endpoint = `/api/v1/me/mcp-keys?status=active&limit=20${paging.after ? `&after=${encodeURIComponent(paging.after)}` : ''}`
 const remote = useApiData(endpoint, parsePersonalMcpKeys), mutation = useIntegrationMutation()
 const [creating, setCreating] = useState(false), [name, setName] = useState(''), [readOnly, setReadOnly] = useState(false), [duration, setDuration] = useState('2592000')
 const [secret, setSecret] = useState<string | null>(null), [copied, setCopied] = useState(false), [revoking, setRevoking] = useState<PersonalMcpKeyMetadata | null>(null), [copyError, setCopyError] = useState<string | null>(null)
 const data = remote.data
 const activeKeys=data?.items.filter(key=>!isPersonalMcpKeyInactive(key,data.server_time))??[]
 const url = `${typeof window === 'undefined' ? 'https://nexora.com' : window.location.origin}/mcp`
 const config = JSON.stringify({ mcpServers: { nexora: { url, headers: { Authorization: 'Bearer YOUR_API_KEY' } } } }, null, 2)
 useEffect(() => { const timer = window.setInterval(remote.reload, 30_000); return () => window.clearInterval(timer) }, [remote.reload])
 const valid = !!data?.can_create && name.trim().length > 0 && name.trim().length <= 160
 async function copy(value: string) { try { await navigator.clipboard.writeText(value); setCopied(value === secret); setCopyError(null) } catch { setCopyError('No pudimos copiar el contenido. Puedes seleccionarlo y copiarlo manualmente.') } }
 return <section aria-labelledby="profile-mcp-title" className="min-w-0">
  <header className="mb-4 flex flex-wrap items-center justify-between gap-2"><h1 id="profile-mcp-title" className="flex items-center gap-2 text-xl font-semibold"><KeyRound size={17}/>{t('Acceso MCP')}</h1><div className="flex gap-1"><RowAction to="/settings/mcp/history" label={t('Historial de claves MCP')}><History size={16}/></RowAction><IconButton label={t('Actualizar actividad MCP')} onClick={remote.reload} disabled={remote.loading}><RefreshCw size={16}/></IconButton>{data?.can_create && <IconButton label={t('Generar clave MCP')} variant="primary" onClick={() => { setCreating(value => !value); mutation.clearError() }}><Plus size={16}/></IconButton>}</div></header>
  <p className="mb-4 text-sm leading-relaxed text-base-content/55">{t(requestsOnly?'Conecta tu asistente con Nexora para gestionar solicitudes según tus permisos.':'Conecta tu asistente de desarrollo con Nexora usando una clave personal. Sus proyectos y permisos se actualizan automáticamente con tus asignaciones.')}</p>
  {!data ? <DataMessage loading={remote.loading} error={t(remote.error)} onRetry={remote.reload}/> : <>
   {creating && <form aria-label={t('Generar clave MCP')} className="mb-6 space-y-4" onSubmit={event => { event.preventDefault(); if (!valid || mutation.busy) return; const input = { name: name.trim(), project_ids: [], read_only: readOnly, include_global: true, expires_in_seconds: Number(duration) }; void mutation.run(input, async (signal, key) => { const issued = await createPersonalMcpKey(input, signal, key); setSecret(issued); setCopied(false); setCreating(false); setName(''); remote.reload() }) }}>
    <label className="flex flex-col gap-2 text-sm">{t('Nombre de la clave')}<input className="input input-sm w-full" value={name} maxLength={160} required onChange={event => setName(event.target.value)} disabled={mutation.busy} autoComplete="off"/></label>
    <p className="text-sm text-base-content/60">{t(requestsOnly?'Tu clave permite consultar solicitudes y aportar comentarios y evidencia según tu rol.':'El MCP hereda tus proyectos autorizados, incluidos los que te asignen después. Si te retiran el acceso, también se retira del MCP.')}</p>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={readOnly} disabled={mutation.busy} onChange={event => setReadOnly(event.target.checked)}/>{t('Solo lectura')}</label>
    <label className="flex flex-col gap-2 text-sm">{t('Vigencia')}<Dropdown label={t('Vigencia de la clave MCP')} value={duration} onChange={setDuration} disabled={mutation.busy} options={[{ value: '86400', label: t('1 día') }, { value: '604800', label: t('7 días') }, { value: '2592000', label: t('30 días') }, { value: '7776000', label: t('90 días') }]}/></label>
    <div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={() => setCreating(false)}><X size={15}/></TextButton><TextButton type="submit" label={t('Generar clave MCP')} variant="primary" disabled={!valid || mutation.busy} aria-busy={mutation.busy}><KeyRound size={15}/></TextButton></div>
   </form>}
   {secret && <section aria-label={t('Clave MCP recién generada')} className="mb-6 space-y-3 rounded-xl bg-base-200/40 p-4"><p className="text-sm font-medium">{t('Copia esta clave ahora. Solo se muestra una vez.')}</p><div className="flex min-w-0 gap-2"><input aria-label={t('Clave MCP recién generada')} className="input input-sm min-w-0 flex-1 font-mono" readOnly type="password" value={secret} autoComplete="off"/><IconButton label={t(copied ? 'Copiado' : 'Copiar clave MCP')} onClick={() => void copy(secret)}>{copied ? <Check size={15}/> : <Copy size={15}/>}</IconButton><IconButton label={t('Ocultar clave MCP')} onClick={() => { setSecret(null); setCopied(false) }}><X size={15}/></IconButton></div><p className="text-xs text-base-content/55">{t('Si la pierdes, revócala y genera una nueva. El servidor no conserva el secreto recuperable.')}</p></section>}
   <p className="mb-3 text-xs leading-relaxed text-base-content/45">{t('La actividad reciente indica un intercambio MCP correcto en los últimos cinco minutos. MCP usa solicitudes independientes; no representa una conexión permanente.')}</p>
   {activeKeys.length ? <><PersonalMcpKeyTable items={activeKeys} projects={data.projects} now={data.server_time} busy={mutation.busy} onRevoke={item=>{mutation.clearError();setRevoking(item)}} onCopyScope={item=>void copy(item.scope.capabilities.join(' · '))}/><Pagination page={paging.page ?? 1} hasPrevious={paging.hasPrevious} hasNext={!!data.has_more && !!data.next_after} onPrevious={paging.previous} onNext={() => { if (data.next_after) paging.next(data.next_after) }} count={activeKeys.length} busy={remote.loading}/></> : <p className="py-5 text-sm text-base-content/50">{t('No tienes claves MCP activas.')}</p>}
   <section className="mt-5 space-y-4" aria-labelledby="mcp-connection-guide"><h2 id="mcp-connection-guide" className="text-sm font-semibold">{t('Cómo conectar tu asistente')}</h2><p className="text-sm leading-relaxed text-base-content/60">{t('Agrega un servidor MCP remoto con esta URL y el encabezado Authorization: Bearer seguido de tu clave. Después inicia la conexión desde tu asistente y actualiza esta sección para comprobar su actividad.')}</p><div className="flex min-w-0 items-center gap-2"><input className="input input-sm min-w-0 flex-1 font-mono" readOnly value={url} aria-label={t('URL del servidor MCP')}/><IconButton label={t('Copiar URL MCP')} onClick={() => { setCopied(false); void copy(url) }}><Copy size={15}/></IconButton></div><p className="text-sm text-base-content/60">{t(requestsOnly?'Tu asistente puede usar nexora_request_list, nexora_request_create, nexora_request_comment y nexora_request_attachment_upload. Comprueba tu identidad con nexora_permissions_get.':'Tu asistente puede consultar nexora_projects_list para conocer los proyectos disponibles y nexora_permissions_get para comprobar sus permisos.')}</p><p className="text-xs text-base-content/50">{t('Ejemplo para clientes que aceptan configuración JSON. Reemplaza YOUR_API_KEY por tu clave en el cliente.')}</p><Suspense fallback={<p className="text-sm text-base-content/50">{t('Cargando editor…')}</p>}><JsonCodeViewer maxHeight={320} value={config} label={t('Configuración del cliente MCP')}/></Suspense></section>
  </>}
  {(mutation.error || copyError) && <p role="alert" className="mt-3 text-sm text-error">{t(mutation.error ?? copyError)}</p>}
  {revoking && <IntegrationDialog title={t('Revocar clave MCP')} busy={mutation.busy} onClose={() => setRevoking(null)}><p className="text-sm leading-relaxed text-base-content/65">{t('El asistente que utiliza esta clave perderá el acceso. Esta acción no se puede deshacer.')}</p><p className="mt-3 break-words font-medium">{revoking.name}</p>{mutation.error && <p className="mt-3 text-sm text-error">{t(mutation.error)}</p>}<footer className="mt-5 flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={() => setRevoking(null)}><X size={15}/></TextButton><TextButton type="button" label={t('Revocar clave MCP')} variant="error" disabled={mutation.busy} onClick={() => { const id = revoking.id; void mutation.run({ revoke: id }, async (signal, key) => { await revokePersonalMcpKey(id, signal, key); setRevoking(null); remote.reload() }) }}><Trash2 size={15}/></TextButton></footer></IntegrationDialog>}
 </section>
}
