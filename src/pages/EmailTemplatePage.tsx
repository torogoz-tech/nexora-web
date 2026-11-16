import { lazy, Suspense, useId, useState } from 'react'
import { Code2, Eye, Save, Check, RotateCcw } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useSettingsResource } from '../hooks/useSettingsResource'
import { useBranding } from '../hooks/useBranding'
import { parseEmailTemplate } from '../utils/parseEmailTemplate'
import { validateEmailTemplate } from '../utils/validateEmailTemplate'
import { renderEmailPreview } from '../utils/renderEmailPreview'
import { Link } from 'react-router'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'

const HtmlCodeEditor = lazy(() => import('../components/HtmlCodeEditor'))

export default function EmailTemplatePage() {
  const { t } = useTranslation()
  const brand = useBranding()
  const resource = useSettingsResource('/api/v1/settings/email-template', parseEmailTemplate)
  const [draft, setDraft] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const [tab, setTab] = useState<'html' | 'preview'>('html')
  const tabsId = useId()
  const html = draft ?? resource.data?.html ?? ''
  const validation = validateEmailTemplate(html)
  const dirty = !!resource.data && html !== resource.data.html
  async function save() {
    if (!resource.data || validation) return
    const submitted = html
    if (await resource.save({html:submitted, expected_revision:resource.data.revision})) setSaved(submitted)
  }
  return <section className="flex min-w-0 flex-1 flex-col">
    <Link to="/settings/email-template" className="mb-5 w-fit text-xs text-base-content/55 hover:text-base-content">← {t('Volver a correos')}</Link>
    <header className="mb-6 flex items-center justify-between gap-4">
      <div><h1 className="text-xl font-semibold">{t('Diseño común del correo')}</h1><p className="mt-2 text-sm text-base-content/55">{t('Un diseño compartido para todos los correos de tu organización.')}</p></div>
      <div className="flex gap-2">
        <IconButton label={t('Descartar cambios')} disabled={!dirty || resource.busy} onClick={() => {setDraft(null);setSaved(null)}}><RotateCcw size={17} /></IconButton>
        <IconButton label={saved === html && !dirty ? t('Guardado') : t('Guardar plantilla')} variant="primary" disabled={!dirty || !!validation || resource.busy} aria-busy={resource.busy} onClick={() => void save()}>{saved === html && !dirty ? <Check size={17}/> : <Save size={17}/>}</IconButton>
      </div>
    </header>
    {resource.loading || !resource.data ? <DataMessage loading={resource.loading} error={resource.error} onRetry={resource.reload}/> : <>
      <div className="mb-5 rounded-xl bg-base-200 p-4 text-sm">
        <p>{t('Esta plantilla define el envoltorio y los estilos. En {{body}} Nexora inserta el mensaje configurado para cada evento e idioma.')}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-base-content/60">
          <span><code className="text-base-content">{'{{body}}'}</code> · {t('Contenido obligatorio')}</span>
          <span><code className="text-base-content">{'{{subject}}'}</code> · {t('Asunto')}</span>
          <span><code className="text-base-content">{'{{organization_name}}'}</code> · {t('Organización')}</span>
        </div>
      </div>
      <div className="min-w-0 overflow-hidden rounded-2xl border border-base-300">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
          <div role="tablist" aria-label={t('Editor de plantilla')} className="flex gap-1 rounded-xl bg-base-200 p-1"
            onKeyDown={event => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const next = event.key === 'Home' ? 'html' : event.key === 'End' ? 'preview' : tab === 'html' ? 'preview' : 'html'
              setTab(next)
              event.currentTarget.querySelector<HTMLButtonElement>(`[id="${tabsId}-${next}-tab"]`)?.focus()
            }}>
            <button type="button" role="tab" id={`${tabsId}-html-tab`} aria-controls={`${tabsId}-html-panel`} aria-selected={tab === 'html'} tabIndex={tab === 'html' ? 0 : -1}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab === 'html' ? 'bg-base-300 font-medium' : 'text-base-content/60'}`} onClick={() => setTab('html')}>
              <Code2 size={16} aria-hidden="true" />HTML
            </button>
            <button type="button" role="tab" id={`${tabsId}-preview-tab`} aria-controls={`${tabsId}-preview-panel`} aria-selected={tab === 'preview'} tabIndex={tab === 'preview' ? 0 : -1}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab === 'preview' ? 'bg-base-300 font-medium' : 'text-base-content/60'}`} onClick={() => setTab('preview')}>
              <Eye size={16} aria-hidden="true" />{t('Vista previa')}
            </button>
          </div>
          {tab === 'preview' && <div className="flex gap-1 rounded-lg bg-base-200 p-1" role="group" aria-label={t('Tamaño de vista previa')}>
            <button type="button" aria-pressed={!mobile} className={`rounded-md px-2 py-1.5 text-xs ${!mobile ? 'bg-base-300' : ''}`} onClick={() => setMobile(false)}>{t('Escritorio')}</button>
            <button type="button" aria-pressed={mobile} className={`rounded-md px-2 py-1.5 text-xs ${mobile ? 'bg-base-300' : ''}`} onClick={() => setMobile(true)}>{t('Móvil')} · 375 px</button>
          </div>}
        </div>
        <section role="tabpanel" id={`${tabsId}-html-panel`} aria-labelledby={`${tabsId}-html-tab`} hidden={tab !== 'html'}>
          <Suspense fallback={<DataMessage loading />}>
            <HtmlCodeEditor value={html} onChange={next => {setDraft(next);setSaved(null)}} onSave={() => { if (dirty && !resource.busy) void save() }} />
          </Suspense>
        </section>
        <section role="tabpanel" id={`${tabsId}-preview-panel`} aria-labelledby={`${tabsId}-preview-tab`} hidden={tab !== 'preview'}>
          <div className="min-h-[36rem] overflow-x-auto bg-base-200 p-3">
            <iframe title={t('Vista previa del correo')} sandbox="" referrerPolicy="no-referrer" srcDoc={renderEmailPreview(html, brand.name || 'Nexora', t('Te han invitado a unirte a la organización'), t('Hola,\n\nHas recibido una invitación para colaborar con tu equipo en Nexora.\n\nAquí aparecerán los detalles y el enlace para aceptar la invitación.'))} className={`mx-auto block h-[34rem] max-w-none rounded-xl bg-white ${mobile ? 'w-[375px]' : 'w-full min-w-[600px]'}`}/>
          </div>
        </section>
      </div>
      {dirty && validation && <p className="mt-3 text-sm text-error" role="alert">{t(validation)}</p>}
      {resource.error && <p className="mt-3 text-sm text-error" role="alert">{t(resource.error)}</p>}
      <p className="mt-4 text-xs text-base-content/50">{t('La vista previa utiliza datos de ejemplo. No envía correos. Los cambios se aplican a los próximos envíos.')}</p>
    </>}
  </section>
}
