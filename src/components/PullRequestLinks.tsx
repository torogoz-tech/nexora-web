import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import RowAction from './RowAction'
import Dropdown from './Dropdown'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Link2,
  Unlink,
  RefreshCw,
  X,
} from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { parsePullRequestLinks } from '../utils/parsePullRequestLinks'
import { parseReferenceTargets } from '../utils/parseReferenceTargets'
import { createPullRequestLink } from '../services/createPullRequestLink'
import { removePullRequestLink } from '../services/removePullRequestLink'
import DataMessage from './DataMessage'
import type { PullRequestLinksProps } from '../types/PullRequestLinksProps'
import type { PullRequestLink } from '../types/PullRequestLink'
export default function PullRequestLinks({
  basePath,
  projectId,
}: PullRequestLinksProps) {
  const { t } = useTranslation()
  const [kind, setKind] = useState<'task' | 'requirement'>('task')
  const [targetId, setTargetId] = useState('')
  const [reason, setReason] = useState('')
  const [after, setAfter] = useState('')
  const [linksAfter, setLinksAfter] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState('')
  const request = useRef<AbortController | null>(null)
  const receipt = useRef<{ signature: string; key: string } | null>(null)
  const links = useApiData(
    `${basePath}/links?limit=100${linksAfter ? `&after=${encodeURIComponent(linksAfter)}` : ''}`,
    parsePullRequestLinks,
  )
  const targetsPath = `/api/v1/projects/${encodeURIComponent(projectId)}/${kind === 'task' ? 'tasks' : 'documents'}?limit=50${kind === 'requirement' ? '&kind=requirement' : ''}${after ? `&after=${encodeURIComponent(after)}` : ''}`
  const targets = useApiData(targetsPath, parseReferenceTargets)
  useEffect(() => () => request.current?.abort(), [])
  function keyFor(value: unknown) {
    const signature = JSON.stringify(value)
    if (receipt.current?.signature !== signature)
      receipt.current = { signature, key: crypto.randomUUID() }
    return receipt.current.key
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current) return
    const selected = targets.data?.items.find((item) => item.id === targetId)
    if (!selected || !reason.trim()) return
    const input = {
      kind,
      target_id: selected.id,
      target_revision: selected.revision,
      version_id: selected.versionId,
      reason: reason.trim(),
    }
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await createPullRequestLink(
        basePath,
        input,
        keyFor(input),
        controller.signal,
      )
      if (!controller.signal.aborted) {
        setTargetId('')
        setReason('')
        setLinksAfter('')
        links.reload()
        setNotice('Vínculo guardado.')
      }
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error &&
            failure.name !== 'TypeError' &&
            failure.name !== 'TimeoutError'
            ? failure.message
            : 'No pudimos confirmar el vínculo. Vuelve a intentarlo.',
        )
    } finally {
      request.current = null
      setBusy(false)
    }
  }
  async function remove(link: PullRequestLink) {
    if (request.current || !removeReason.trim()) return
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    setError(null)
    setNotice(null)
    const input = {
      id: link.id,
      revision: link.revision,
      reason: removeReason.trim(),
    }
    try {
      await removePullRequestLink(
        basePath,
        link.id,
        link.revision,
        input.reason,
        keyFor(input),
        controller.signal,
      )
      if (!controller.signal.aborted) {
        setRemoving(null)
        setRemoveReason('')
        links.reload()
        setNotice('Vínculo retirado.')
      }
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error &&
            failure.name !== 'TypeError' &&
            failure.name !== 'TimeoutError'
            ? failure.message
            : 'No pudimos confirmar el cambio. Vuelve a intentarlo.',
        )
    } finally {
      request.current = null
      setBusy(false)
    }
  }
  return (
    <div className="py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {' '}
          {t('Tareas y requerimientos vinculados')}{' '}
        </h2>
        <IconButton
          type="button"
          variant="ghost"
          disabled={busy || links.loading}
          onClick={() => {
            links.reload()
            targets.reload()
          }}
          label={t('Actualizar vínculos')}
        >
          <RefreshCw size={15} />
        </IconButton>
      </div>
      {links.loading || links.error ? (
        <DataMessage
          loading={links.loading}
          error={t(links.error)}
          onRetry={links.reload}
        />
      ) : (
        <>
          {links.data?.restricted && (
            <p className="mt-3 text-xs text-base-content/50">
              {' '}
              {t(
                'Los vínculos visibles dependen de tus permisos sobre tareas y documentos.',
              )}{' '}
            </p>
          )}
          {links.data?.items.length === 0 && (
            <p className="py-6 text-sm text-base-content/50">
              {' '}
              {t('Esta PR no tiene vínculos visibles en esta página.')}{' '}
            </p>
          )}
          <ul className="divide-y divide-base-300">
            {links.data?.items.map((link) => (
              <li key={link.id} className="py-4">
                <div className="flex items-start gap-3">
                  <Link2
                    size={16}
                    className="mt-1 shrink-0 text-base-content/45"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm">
                      {link.code ? `${link.code} · ` : ''}
                      {link.title}
                    </p>
                    <p className="mt-1 text-xs text-base-content/45">
                      {link.kind === 'task' ? t('Tarea') : t('Requerimiento')}
                      {link.version_id ? t(' · Versión vinculada') : ''}
                    </p>
                  </div>
                  <RowAction
                    label={t('Quitar vínculo {0}', { '0': link.title })}
                    disabled={busy}
                    onClick={() => {
                      setRemoving(link.id)
                      setRemoveReason('')
                    }}
                  >
                    <Unlink size={16} aria-hidden="true" />
                  </RowAction>
                </div>
                {removing === link.id && (
                  <div className="mt-3 flex flex-col gap-3 rounded-xl border border-base-300 p-3">
                    <label className="flex flex-col gap-2 text-xs">
                      {' '}
                      {t('Motivo para retirar el vínculo')}{' '}
                      <input
                        className="input input-sm w-full"
                        maxLength={1000}
                        value={removeReason}
                        disabled={busy}
                        onChange={(event) =>
                          setRemoveReason(event.target.value)
                        }
                      />
                    </label>
                    <div className="flex justify-end gap-2">
                      <RowAction
                        label={t('Cancelar')}
                        disabled={busy}
                        onClick={() => setRemoving(null)}
                      >
                        <X size={16} aria-hidden="true" />
                      </RowAction>
                      <RowAction
                        label={t('Retirar vínculo')}
                        disabled={busy || !removeReason.trim()}
                        onClick={() => void remove(link)}
                      >
                        <Unlink size={16} aria-hidden="true" />
                      </RowAction>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {links.data?.next_cursor && (
            <IconButton
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => setLinksAfter(links.data!.next_cursor!)}
              label={t('Ver siguientes vínculos')}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </IconButton>
          )}
          {linksAfter && (
            <IconButton
              type="button"
              variant="ghost"
              className="mt-3"
              onClick={() => setLinksAfter('')}
              label={t('Volver al inicio')}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </IconButton>
          )}
          <form
            className="mt-6 flex flex-col gap-4 rounded-xl border border-base-300 p-4"
            onSubmit={submit}
          >
            <h3 className="text-sm font-medium">{t('Agregar vínculo')}</h3>
            <div className="flex flex-wrap gap-3">
              <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs">
                {' '}
                {t('Tipo')}{' '}
                <Dropdown
                  label={t('Tipo')}
                  value={kind}
                  disabled={busy}
                  onChange={(value) => {
                    setKind(value as 'task' | 'requirement')
                    setTargetId('')
                    setAfter('')
                  }}
                  options={[
                    { value: 'task', label: t('Tarea') },
                    { value: 'requirement', label: t('Requerimiento') },
                  ]}
                />
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs">
                {' '}
                {t('Destino')}{' '}
                <Dropdown
                  label={t('Destino')}
                  value={targetId}
                  required
                  disabled={busy || targets.loading || !!targets.error}
                  onChange={setTargetId}
                  placeholder={t('Selecciona un destino')}
                  options={(targets.data?.items ?? []).map((item) => ({
                    value: item.id,
                    label: item.label,
                  }))}
                />
              </label>
            </div>
            {targets.loading && (
              <p role="status" className="text-xs text-base-content/50">
                {' '}
                {t('Cargando destinos…')}{' '}
              </p>
            )}
            {targets.error && (
              <div role="alert">
                <p className="text-xs text-error">{t(targets.error)}</p>
                <IconButton
                  type="button"
                  variant="ghost"
                  className="mt-2"
                  onClick={targets.reload}
                  label={t('Reintentar')}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                </IconButton>
              </div>
            )}
            {targets.data?.items.length === 0 && (
              <p className="text-xs text-base-content/50">
                {' '}
                {t('No hay destinos disponibles en esta página.')}{' '}
              </p>
            )}
            {targets.data?.next_after && (
              <IconButton
                type="button"
                variant="ghost"
                className="self-start"
                disabled={busy}
                onClick={() => {
                  setAfter(targets.data!.next_after!)
                  setTargetId('')
                }}
                label={t('Más destinos')}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </IconButton>
            )}
            {after && (
              <IconButton
                type="button"
                variant="ghost"
                className="self-start"
                disabled={busy}
                onClick={() => {
                  setAfter('')
                  setTargetId('')
                }}
                label={t('Primeros destinos')}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </IconButton>
            )}
            <label className="flex flex-col gap-2 text-xs">
              {' '}
              {t('Motivo')}{' '}
              <textarea
                className="textarea w-full"
                required
                maxLength={1000}
                disabled={busy}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <IconButton
              type="submit"
              variant="primary"
              className="self-end"
              disabled={busy || !targetId || !reason.trim() || targets.loading}
              label={busy ? t('Guardando…') : t('Vincular')}
              aria-busy={busy}
            >
              <Link2 size={16} aria-hidden="true" />
            </IconButton>
          </form>
        </>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-error">
          {t(error)}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm text-success">
          {t(notice)}
        </p>
      )}
    </div>
  )
}
