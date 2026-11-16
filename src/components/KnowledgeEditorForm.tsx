import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { apiFetch } from '../services/apiFetch'
import { uploadKnowledgeImage } from '../services/uploadKnowledgeImage'
import MarkdownEditor from './MarkdownEditor'
import IconButton from './IconButton'
import TextButton from './TextButton'
export default function KnowledgeEditorForm({
  id,
  source,
  kind,
  projectId,
  document,
  canEdit,
}: {
  id?: string
  source: string
  kind: string
  projectId: string | null
  document?: { title: string; body?: string; revision: number }
  canEdit: boolean
}) {
  const { t } = useTranslation(),
    navigate = useNavigate(),
    mutation = useIntegrationMutation()
  const [title, setTitle] = useState(document?.title ?? ''),
    [body, setBody] = useState(document?.body ?? ''),
    [file, setFile] = useState<File | null>(null),
    [uploading, setUploading] = useState(false)
  const organization = source === 'organization'
  const route =
    (
      {
        requirement: '/knowledge/requirements',
        business_rule: '/knowledge/rules',
        decision: '/knowledge/decisions',
        best_practice: '/knowledge/best-practices',
        security:'/knowledge/security',
        technical_debt: '/knowledge/technical-debt',
      } as Record<string, string>
    )[kind] ?? '/knowledge'
  const query = new URLSearchParams({ project: projectId ?? 'organization' })
  if (id) query.set(organization ? 'article' : 'contribution', id)
  const back = `${route}?${query}`
  const valid =
    title.trim() &&
    (file || (canEdit && body.trim())) &&
    new TextEncoder().encode(body).length <= 131072
  return (
    <section className="min-w-0 flex-1">
      <div className="mb-5">
        <IconButton
          label={t('Volver al catálogo')}
          disabled={mutation.busy || uploading}
          onClick={() => navigate(back)}
        >
          <ArrowLeft size={16} />
        </IconButton>
      </div>
      <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl">
          {t(id ? 'Editar documento' : 'Crear documento')}
        </h1>
        <div className="flex gap-2">
          <TextButton
            label={t('Cancelar')}
            disabled={mutation.busy || uploading}
            onClick={() => navigate(back)}
          >
            <X size={15} />
          </TextButton>
          <TextButton
            label={t('Guardar cambios')}
            variant="primary"
            form="knowledge-editor"
            type="submit"
            aria-busy={mutation.busy}
            disabled={mutation.busy || uploading || !valid}
          >
            <Save size={15} />
          </TextButton>
        </div>
      </header>
      <form
        id="knowledge-editor"
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid || uploading) return
          void mutation.run(
            {
              id,
              title,
              body,
              file: file?.name,
              size: file?.size,
              modified: file?.lastModified,
            },
            async (signal, key) => {
              let encoded: string | undefined
              if (file) {
                if (!file.size || file.size > 5 * 1024 * 1024)
                  throw Error('El documento admite hasta 5 MB.')
                const bytes = new Uint8Array(await file.arrayBuffer())
                let binary = ''
                for (let i = 0; i < bytes.length; i += 8192)
                  binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
                encoded = btoa(binary)
              }
              const base = organization
                ? '/api/v1/knowledge/organization/documents'
                : '/api/v1/knowledge/contributions'
              const response = await apiFetch(
                `${base}${id ? `/${encodeURIComponent(id)}` : ''}`,
                {
                  method: id ? 'PATCH' : 'POST',
                  signal,
                  headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': key,
                  },
                  body: JSON.stringify({
                    kind,
                    title,
                    body,
                    expected_revision: id ? document?.revision : null,
                    ...(!organization ? { project_id: projectId } : {}),
                    ...(file
                      ? { filename: file.name, data_base64: encoded }
                      : {}),
                  }),
                },
              )
              if (!response.ok)
                throw Error(
                  response.status === 409
                    ? 'El documento cambió. Actualiza antes de continuar.'
                    : 'No pudimos guardar el documento.',
                )
              const saved = await response.json()
              if (typeof saved.id !== 'string')
                throw Error('Respuesta de documentación no válida.')
              const next = new URLSearchParams({
                project: projectId ?? 'organization',
                [organization ? 'article' : 'contribution']: saved.id,
              })
              window.dispatchEvent(
                new CustomEvent('nexora:invalidate', {
                  detail: { projectId, topics: ['knowledge'] },
                }),
              )
              navigate(`${route}?${next}`, { replace: true })
            },
          )
        }}
      >
        <label className="flex flex-col gap-2 text-sm">
          {t('Título')}
          <input
            className="input w-full"
            value={title}
            maxLength={256}
            disabled={mutation.busy}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        {!organization && kind === 'document' && (
          <div>
            <label className="btn btn-sm btn-ghost inline-flex">
              <Upload size={16} />
              {t(id ? 'Subir nueva versión' : 'Subir documento')}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.xlsx,.pptx,.txt,.md,.csv"
                disabled={mutation.busy || uploading}
                onChange={(e) => {
                  const chosen = e.target.files?.[0]
                  if (chosen) {
                    setFile(chosen)
                    if (!title.trim()) setTitle(chosen.name)
                  }
                  e.target.value = ''
                }}
              />
            </label>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="break-all">{file.name}</span>
                <IconButton
                  label={t('Quitar archivo')}
                  disabled={mutation.busy}
                  onClick={() => setFile(null)}
                >
                  <X size={14} />
                </IconButton>
              </div>
            )}
          </div>
        )}
        {!file && canEdit && (
          <MarkdownEditor
            label={t('Contenido Markdown')}
            allowImages
            allowDiagrams
            uploadImage={(file) => uploadKnowledgeImage(file, projectId)}
            onUploadingChange={setUploading}
            value={body}
            maxLength={131072}
            disabled={mutation.busy}
            onChange={setBody}
          />
        )}
        {mutation.error && (
          <p role="alert" className="text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
      </form>
    </section>
  )
}
