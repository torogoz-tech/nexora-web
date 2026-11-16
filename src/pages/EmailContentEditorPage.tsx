import { lazy, Suspense, useState } from 'react'
import { Link, useBeforeUnload } from 'react-router'
import { ArrowLeft, Check, Code2, Eye, RotateCcw, Save, Undo2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useSettingsResource } from '../hooks/useSettingsResource'
import { useApiData } from '../hooks/useApiData'
import { useBranding } from '../hooks/useBranding'
import { parseEmailContent } from '../utils/parseEmailContent'
import { parseEmailTemplate } from '../utils/parseEmailTemplate'
import { validateEmailContent } from '../utils/validateEmailContent'
import { renderEmailContentPreview } from '../utils/renderEmailContentPreview'
import { renderEmailPreview } from '../utils/renderEmailPreview'
import { emailContentLabels } from '../app/emailContentLabels'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
import type { EmailContentEditorProps } from '../types/EmailContentEditorProps'
const HtmlCodeEditor = lazy(() => import('../components/HtmlCodeEditor'))

export default function EmailContentEditorPage({kind,language}: EmailContentEditorProps) {
  const {t,language:uiLanguage}=useTranslation()
  const brand=useBranding()
  const resource=useSettingsResource(`/api/v1/settings/email-contents/${encodeURIComponent(kind)}/${encodeURIComponent(language)}`,parseEmailContent)
  const layout=useApiData('/api/v1/settings/email-template',parseEmailTemplate)
  const [draft,setDraft]=useState<{subject:string;body_html:string}|null>(null)
  const [saved,setSaved]=useState(false)
  const [tab,setTab]=useState<'html'|'preview'>('html')
  const [mobile,setMobile]=useState(false)
  const item=resource.data
  const subject=draft?.subject??item?.subject??''
  const html=draft?.body_html??item?.body_html??''
  const dirty=!!item&&(subject!==item.subject||html!==item.body_html)
  const validation=item?validateEmailContent(item,subject,html):null
  useBeforeUnload(event=>{if(dirty){event.preventDefault();event.returnValue=''}})
  async function save() {
    if (!item || !dirty || resource.busy || validation) return
    if(await resource.save({subject,body_html:html,expected_revision:item.revision}))setSaved(true)
  }
  const preview=item?renderEmailContentPreview(item,subject,html,brand.name||'Nexora'):null
  const previewHtml=layout.data&&preview?renderEmailPreview(layout.data.html,brand.name||'Nexora',preview.subject,preview.body,true):''
  return <section className="flex min-w-0 flex-1 flex-col">
    <Link to="/settings/email-template" className="mb-5 flex w-fit items-center gap-2 text-xs text-base-content/55 hover:text-base-content"><ArrowLeft size={14}/>{t('Volver a correos')}</Link>
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-semibold">{t(emailContentLabels[kind]??'Correo')}</h1></div>
      <div className="flex gap-2">
        <IconButton label={t('Restaurar contenido predeterminado')} disabled={!item||resource.busy||(subject===item.default_subject&&html===item.default_body_html)} onClick={()=>{if(item){setDraft({subject:item.default_subject,body_html:item.default_body_html});setSaved(false)}}}><RotateCcw size={17}/></IconButton>
        <IconButton label={t('Descartar cambios')} disabled={!dirty||resource.busy} onClick={()=>{setDraft(null);setSaved(false)}}><Undo2 size={17}/></IconButton>
        <IconButton label={t(saved&&!dirty?'Guardado':'Guardar correo')} variant="primary" disabled={!dirty||!!validation||resource.busy} aria-busy={resource.busy} onClick={()=>void save()}>{saved&&!dirty?<Check size={17}/>:<Save size={17}/>}</IconButton>
      </div>
    </header>
    {resource.loading||!item?<DataMessage loading={resource.loading} error={resource.error} onRetry={resource.reload}/>:<>

      <label className="mb-5 flex flex-col gap-2 text-sm font-medium">{t('Asunto')}<input className="input w-full font-normal" value={subject} maxLength={1000} onChange={e=>{setDraft({subject:e.target.value,body_html:html});setSaved(false)}}/></label>
      <p className="mb-4 text-xs leading-relaxed text-base-content/55">{t('El asunto es el encabezado del correo en la bandeja de entrada; no se añade automáticamente al contenido.')}</p>
      <p className="mb-5 text-xs leading-relaxed text-base-content/55">{t('El encabezado, el pie y los estilos exteriores se editan en el diseño común.')} <Link className="underline underline-offset-4 hover:text-base-content" to="/settings/email-template/layout">{t('Editar diseño común')}</Link></p>
      <details className="mb-5 rounded-xl border border-base-300 p-4">
        <summary className="cursor-pointer text-sm font-medium">{t('Parámetros disponibles')} · {item.parameters.length}</summary>
        <p className="mt-3 text-xs leading-relaxed text-base-content/55">{t('Nexora proporciona estos valores al enviar. Conserva los parámetros obligatorios; los enlaces de ejemplo no son invitaciones reales.')}</p>
        <dl className="mt-3 space-y-3">{item.parameters.map(p=><div key={p.name} className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <dt className="text-xs"><code>{`{{${p.name}}}`}</code>{p.required&&<span className="ml-2 text-base-content/50">{t('Obligatorio')}</span>}</dt>
          <dd className="text-xs text-base-content/60">{uiLanguage==='es'?p.description_es:p.description_en}</dd>
        </div>)}</dl>
      </details>
      <div className="min-w-0 overflow-hidden rounded-2xl border border-base-300">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
          <div role="tablist" aria-label={t('Editor de contenido')} className="flex gap-1 rounded-xl bg-base-200 p-1" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'html':e.key==='End'?'preview':tab==='html'?'preview':'html';setTab(next);e.currentTarget.querySelector<HTMLButtonElement>(`[id="content-${next}-tab"]`)?.focus()}}}>
            <button type="button" role="tab" id="content-html-tab" aria-controls="content-html-panel" aria-selected={tab==='html'} tabIndex={tab==='html'?0:-1} onClick={()=>setTab('html')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab==='html'?'bg-base-300 font-medium':'text-base-content/60'}`}><Code2 size={16}/>HTML</button>
            <button type="button" role="tab" id="content-preview-tab" aria-controls="content-preview-panel" aria-selected={tab==='preview'} tabIndex={tab==='preview'?0:-1} onClick={()=>setTab('preview')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab==='preview'?'bg-base-300 font-medium':'text-base-content/60'}`}><Eye size={16}/>{t('Vista previa')}</button>
          </div>
          {tab==='preview'&&<div role="group" aria-label={t('Tamaño de vista previa')} className="flex gap-1 rounded-lg bg-base-200 p-1"><button type="button" aria-pressed={!mobile} className={`rounded-md px-2 py-1.5 text-xs ${!mobile?'bg-base-300':''}`} onClick={()=>setMobile(false)}>{t('Escritorio')}</button><button type="button" aria-pressed={mobile} className={`rounded-md px-2 py-1.5 text-xs ${mobile?'bg-base-300':''}`} onClick={()=>setMobile(true)}>{t('Móvil')} · 375 px</button></div>}
        </div>
        <section role="tabpanel" id="content-html-panel" aria-labelledby="content-html-tab" hidden={tab!=='html'}><Suspense fallback={<DataMessage loading/>}><HtmlCodeEditor value={html} onChange={next=>{setDraft({subject,body_html:next});setSaved(false)}} onSave={()=>void save()} parameters={item.parameters.map(p=>p.name)}/></Suspense></section>
        <section role="tabpanel" id="content-preview-panel" aria-labelledby="content-preview-tab" hidden={tab!=='preview'}>
          {layout.loading||!layout.data?<DataMessage loading={layout.loading} error={layout.error} onRetry={layout.reload}/>:<div className="min-h-[36rem] overflow-x-auto bg-base-200 p-3"><iframe title={t('Vista previa del correo')} sandbox="" referrerPolicy="no-referrer" srcDoc={previewHtml} className={`mx-auto block h-[34rem] max-w-none rounded-xl bg-white ${mobile?'w-[375px]':'w-full min-w-[600px]'}`}/></div>}
        </section>
      </div>
      {validation&&dirty&&<p className="mt-3 text-sm text-error" role="alert">{t(validation)}</p>}
      {resource.error&&<p className="mt-3 text-sm text-error" role="alert">{t(resource.error)}</p>}
      <p className="mt-4 text-xs text-base-content/50">{t('La vista previa usa parámetros de ejemplo y el diseño común de la organización. No envía correos.')}</p>
    </>}
  </section>
}
