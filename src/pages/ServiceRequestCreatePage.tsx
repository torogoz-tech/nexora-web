import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Paperclip, Plus, RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseProducts } from '../utils/parseProducts'
import { parseServiceRequestTypes } from '../utils/parseServiceRequestTypes'
import { parseServiceRequest } from '../utils/parseServiceRequest'
import { requestCriticalities } from '../utils/requestCriticalities'
import { writeServiceRequest } from '../services/writeServiceRequest'
import { uploadRequestAttachment } from '../services/uploadRequestAttachment'
import MarkdownEditor from '../components/MarkdownEditor'
import DataMessage from '../components/DataMessage'
import Dropdown from '../components/Dropdown'
import IconButton from '../components/IconButton'

export default function ServiceRequestCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const products = useApiData('/api/v1/requests/products', parseProducts)
  const types = useApiData('/api/v1/requests/types', parseServiceRequestTypes)
  const [product, setProduct] = useState('')
  const [criticality, setCriticality] = useState('medium')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('support')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null)
  const key = useRef(crypto.randomUUID())
  const created = useRef<string | null>(null)
  const uploaded = useRef(new Map<File, string>())
  const activeTypes = types.data?.items.filter(item => !item.archived) ?? []
  const selectedType = activeTypes.some(item => item.id === type) ? type : activeTypes[0]?.id ?? ''
  async function save() {
    setBusy(true)
    setError('')
    try {
      if (!created.current) {
        created.current = parseServiceRequest(await writeServiceRequest('/api/v1/requests', { title, body, type_id: selectedType, product_id: product || null, criticality }, key.current)).id
        setCreatedRequestId(created.current)
      }
      for (const file of files) {
        let attachmentKey = uploaded.current.get(file)
        if (attachmentKey === 'done') continue
        if (!attachmentKey) { attachmentKey = crypto.randomUUID(); uploaded.current.set(file, attachmentKey) }
        await uploadRequestAttachment(created.current, file, attachmentKey)
        uploaded.current.set(file, 'done')
      }
      navigate(`/requests/${created.current}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('No pudimos guardar la solicitud.'))
    } finally {
      setBusy(false)
    }
  }
  return <section className="min-w-0 flex-1 pb-12" aria-label={t('Crear solicitud')}>
    <form onSubmit={event => { event.preventDefault(); void save() }} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3"><Link to="/requests" className="inline-flex items-center gap-2 text-sm"><ArrowLeft size={16} />{t('Solicitudes')}</Link><div className="flex shrink-0 gap-2"><IconButton label={t('Actualizar opciones de solicitud')} disabled={busy} onClick={() => { products.reload(); types.reload() }}><RefreshCw size={16} /></IconButton><Link to="/requests" className="btn btn-sm btn-ghost">{t('Cancelar')}</Link><button type="submit" className="btn btn-sm btn-primary" disabled={busy || !title.trim() || !selectedType}><Plus size={16} />{busy ? t('Guardando…') : t('Crear solicitud')}</button></div></header>
      <div><h1 className="text-xl font-semibold">{t('Nueva solicitud')}</h1><p className="mt-2 text-sm text-base-content/60">{t('Describe la necesidad para que el equipo pueda atenderla y darle seguimiento.')}</p></div>
      {error && <p role="alert" className="rounded-xl border border-error/25 p-3 text-sm text-error">{error}</p>}
      <DataMessage loading={products.loading || types.loading} error={products.error || types.error} onRetry={() => { products.reload(); types.reload() }} />
      <fieldset disabled={busy || Boolean(createdRequestId)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2"><label className="flex min-w-0 flex-col gap-2 text-xs">{t('Producto')}<Dropdown label={t('Producto de la solicitud')} value={product} options={[{ value: '', label: t('Sin producto') }, ...products.data?.items.filter(item => !item.archived).map(item => ({ value: item.id, label: item.name })) ?? []]} onChange={setProduct} /></label><label className="flex min-w-0 flex-col gap-2 text-xs">{t('Tipo de solicitud')}<Dropdown label={t('Tipo de solicitud')} value={selectedType} required disabled={!activeTypes.length} options={activeTypes.map(item => ({ value: item.id, label: t(item.name) }))} onChange={setType} /></label></div>
        <label className="flex flex-col gap-2 text-xs">{t('Criticidad')}<Dropdown label={t('Criticidad')} value={criticality} options={requestCriticalities.map(item => ({ value: item.value, label: t(item.label) }))} onChange={setCriticality} /></label>
        <label className="flex flex-col gap-2 text-xs">{t('Título')}<input required maxLength={300} className="input w-full" value={title} onChange={event => setTitle(event.target.value)} autoFocus /></label>
        <MarkdownEditor label={t('Descripción')} value={body} onChange={setBody} maxLength={32000} allowImages onImageFiles={images => setFiles(current => [...current, ...images])} />
      </fieldset>
      <div><label className="btn btn-sm btn-ghost"><Paperclip size={16} />{t('Adjuntar archivos')}<input type="file" multiple className="hidden" disabled={busy || Boolean(createdRequestId)} accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" onChange={event => setFiles([...files, ...Array.from(event.target.files ?? [])])} /></label>{files.length > 0 && <ul className="mt-3 space-y-1 text-sm text-base-content/60">{files.map((file, index) => <li key={`${file.name}-${index}`}>{file.name}</li>)}</ul>}</div>
    </form>
  </section>
}
