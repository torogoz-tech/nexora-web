import RequestTypeGlyph from '../components/RequestTypeGlyph'
import RequestSlaIndicator from '../components/RequestSlaIndicator'
import { requestCriticalities } from '../utils/requestCriticalities'
import ServiceRequestLinkForm from '../components/ServiceRequestLinkForm'
import { useState } from 'react'
import { Link } from 'react-router'
import { AlignLeft, ArrowLeft, Files, History, Link2, MessageSquare, Paperclip, Pencil, RefreshCw, Save, X } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseServiceRequest } from '../utils/parseServiceRequest'
import { parseServiceRequestTypes } from '../utils/parseServiceRequestTypes'
import { serviceRequestStatus } from '../utils/serviceRequestStatus'
import { writeServiceRequest } from '../services/writeServiceRequest'
import { uploadRequestAttachment } from '../services/uploadRequestAttachment'
import { apiFetch } from '../services/apiFetch'
import DataMessage from '../components/DataMessage'
import MarkdownEditor from '../components/MarkdownEditor'
import WikiMarkdown from '../components/WikiMarkdown'
import Tooltip from '../components/Tooltip'

export default function ServiceRequestDetailPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const remote = useApiData(`/api/v1/requests/${id}`, parseServiceRequest)
  const types = useApiData('/api/v1/requests/types', parseServiceRequestTypes)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [criticality, setCriticality] = useState('medium')
  const [status, setStatus] = useState('new')
  const [typeId, setTypeId] = useState('')
  const data = remote.data
  const sections = [
    { id: 'request-description', label: 'Descripción', Icon: AlignLeft },
    { id: 'request-attachments', label: 'Archivos adjuntos', Icon: Files },
    { id: 'request-links', label: 'Trabajo relacionado', Icon: Link2 },
    { id: 'request-history', label: 'Historial', Icon: History },
    { id: 'request-comments', label: 'Conversación', Icon: MessageSquare },
  ]

  function startEditing() {
    if (!data) return
    setCriticality(data.criticality ?? 'medium')
    setStatus(data.status)
    setTypeId(data.type_id)
    setEditing(true)
  }

  async function act(path: string, input: unknown) {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await writeServiceRequest(path, input)
      setBody('')
      setEditing(false)
      remote.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar la solicitud.')
    } finally {
      setBusy(false)
    }
  }

  async function download(attachment: string, name: string) {
    try {
      const response = await apiFetch(`/api/v1/requests/${id}/attachments/${attachment}`)
      if (!response.ok) throw Error(t('No pudimos descargar el archivo.'))
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      setError(String(e))
    }
  }

  return <div className="flex min-w-0 flex-1 items-start gap-3 pb-12 sm:gap-5">
    <nav className="sticky top-5 flex w-10 shrink-0 flex-col items-center gap-2 self-start" aria-label={t('Secciones de la solicitud')}>
      {sections.map(({ id: sectionId, label, Icon }) => <Tooltip key={sectionId} label={t(label)}><a href={`#${sectionId}`} onClick={event => { event.preventDefault(); const element = document.getElementById(sectionId); element?.scrollIntoView({ block: 'start', behavior: 'instant' }); element?.focus({ preventScroll: true }) }} aria-label={t(label)} className="flex size-9 items-center justify-center rounded-xl text-base-content/55 hover:bg-base-200 hover:text-base-content focus-visible:outline-2 focus-visible:outline-primary"><Icon size={17}/></a></Tooltip>)}
    </nav>
    <section className="min-w-0 flex-1" aria-label={t('Detalle de solicitud')}>
      <Link to="/requests" className="mb-5 inline-flex items-center gap-2 text-sm"><ArrowLeft size={16}/>{t('Solicitudes')}</Link>
      <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload}/>
      {data && <>
        <header id="request-overview" tabIndex={-1} className="mb-6 scroll-mt-5">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="mb-2 flex items-center gap-2 text-sm text-base-content/50"><RequestTypeGlyph icon={data.type_icon} color={data.type_color} size={16}/>#{data.number} · {data.type_name}</p><h1 className="break-words text-2xl font-semibold">{data.title}</h1><p className="mt-2 text-sm text-base-content/60">{data.requester_name} · {new Date(data.created_at).toLocaleString()}</p></div><div className="flex shrink-0 gap-2"><button className="btn btn-sm btn-ghost" onClick={remote.reload} aria-label={t('Actualizar')}><RefreshCw size={17}/></button>{data.can_manage && !editing && <button className="btn btn-sm" onClick={startEditing}><Pencil size={16}/>{t('Editar')}</button>}</div></div>
          {!editing && <div className="mt-4 flex flex-wrap items-center gap-2"><span className="badge">{t(serviceRequestStatus(data.status))}</span><span className="badge badge-ghost">{t(({low:'Baja',medium:'Media',high:'Alta',critical:'Crítica'})[data.criticality ?? 'medium'])}</span><span className="text-sm text-base-content/55">{t('Producto')}: {data.product_name ?? t('Sin producto')}</span></div>}
        </header>
        {editing && <form className="mb-6 rounded-xl border border-base-300 p-4" onSubmit={event => { event.preventDefault(); void act(`/api/v1/requests/${id}`, { status, type_id: typeId, criticality, expected_revision: data.revision }) }}><h2 className="mb-4 font-semibold">{t('Editar solicitud')}</h2><div className="grid gap-4 sm:grid-cols-3"><label className="grid gap-1 text-sm">{t('Criticidad')}<select className="select select-sm w-full" value={criticality} onChange={event => setCriticality(event.target.value)} disabled={busy}>{requestCriticalities.map(option => <option key={option.value} value={option.value}>{t(option.label)}</option>)}</select></label><label className="grid gap-1 text-sm">{t('Estado')}<select className="select select-sm w-full" value={status} onChange={event => setStatus(event.target.value)} disabled={busy}>{['new','in_progress','completed'].map(value => <option key={value} value={value}>{t(serviceRequestStatus(value))}</option>)}</select></label><label className="grid gap-1 text-sm">{t('Tipo de solicitud')}<select className="select select-sm w-full" value={typeId} onChange={event => setTypeId(event.target.value)} disabled={busy}>{types.data?.items.filter(item => !item.archived || item.id === data.type_id).map(item => <option key={item.id} value={item.id}>{t(item.name)}</option>)}</select></label></div><div className="mt-4 flex justify-end gap-2"><button type="button" className="btn btn-sm btn-ghost" disabled={busy} onClick={() => setEditing(false)}><X size={15}/>{t('Cancelar')}</button><button className="btn btn-sm btn-primary" disabled={busy}><Save size={15}/>{t('Guardar cambios')}</button></div></form>}
        {error && <p role="alert" className="my-3 text-sm text-error">{t(error)}</p>}
        <div className="mb-6"><RequestSlaIndicator request={data}/></div>
        <section id="request-description" tabIndex={-1} className="scroll-mt-5 border-t border-base-300 py-5"><h2 className="mb-3 text-sm font-semibold">{t('Descripción')}</h2><WikiMarkdown text={data.body} allowImages/></section>
        <section id="request-attachments" tabIndex={-1} className="scroll-mt-5 border-t border-base-300 py-5"><header className="mb-3 flex justify-between"><h2 className="font-semibold">{t('Archivos adjuntos')}</h2><label className="btn btn-sm btn-ghost"><Paperclip size={16}/>{t('Adjuntar')}<input type="file" className="hidden" disabled={busy||uploading} onChange={event => { const file = event.target.files?.[0]; if (file) { setUploading(true); void uploadRequestAttachment(id,file).then(() => remote.reload()).catch(e => setError(String(e))).finally(() => setUploading(false)) } event.target.value = '' }}/></label></header>{data.attachments?.map(attachment => <button key={attachment.id} className="link mr-4 text-sm" onClick={() => void download(attachment.id,attachment.name)}>{attachment.name}</button>)}{!data.attachments?.length && <p className="text-sm text-base-content/50">{t('Sin archivos adjuntos.')}</p>}</section>
        {data.can_manage && <section id="request-links" tabIndex={-1} className="scroll-mt-5 border-t border-base-300 py-5"><h2 className="mb-3 font-semibold">{t('Trabajo interno relacionado')}</h2><Link className="btn btn-sm mb-3" to={`/tasks/new?request=${id}`}>{t('Crear tarea vinculada')}</Link><ServiceRequestLinkForm id={id} revision={data.revision} onSaved={remote.reload}/>{data.links?.map(link => <p key={`${link.kind}:${link.target_id}`} className="mt-2"><Link className="link text-sm" to={link.kind === 'task' ? `/tasks/${link.target_id}` : `/knowledge/features/${link.target_id}?project=${link.project_id ?? ''}`}>{t(link.kind === 'task' ? 'Tarea' : 'Funcionalidad')} · {link.target_id}</Link></p>)}</section>}
        <details id="request-history" className="scroll-mt-5 border-t border-base-300 py-5"><summary className="cursor-pointer text-sm font-semibold">{t('Historial')}</summary><ol className="mt-3 space-y-2 text-xs text-base-content/60">{data.history?.map((entry,index) => <li key={index}>{new Date(entry.created_at).toLocaleString()} · {entry.author_name} · {t(({created:'Solicitud creada',changed:'Solicitud actualizada',commented:'Comentario agregado',attached:'Archivo adjunto'} as Record<string,string>)[entry.action] ?? entry.action)}</li>)}</ol></details>
        <section id="request-comments" tabIndex={-1} className="scroll-mt-5 border-t border-base-300 py-5"><h2 className="mb-4 font-semibold">{t('Conversación')}</h2>{data.comments?.map(comment => <article key={comment.id} className="mb-5 rounded-xl border border-base-300 p-4"><p className="mb-2 text-sm font-medium">{comment.author_name} <time className="font-normal text-base-content/50">{new Date(comment.created_at).toLocaleString()}</time></p><WikiMarkdown text={comment.body} allowImages/></article>)}<form onSubmit={event => { event.preventDefault(); void act(`/api/v1/requests/${id}/comments`,{body}) }}><MarkdownEditor label={t('Agregar comentario')} value={body} onChange={setBody} maxLength={32000} disabled={busy} onUploadingChange={setUploading} uploadImage={file => uploadRequestAttachment(id,file)}/><button className="btn btn-sm mt-3" disabled={busy||uploading||!body.trim()}>{t('Enviar comentario')}</button></form></section>
      </>}
    </section>
  </div>
}
