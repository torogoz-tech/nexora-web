import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { RefreshCw } from 'lucide-react'
import IconButton from './IconButton'
import { ChevronRight, X, Check } from 'lucide-react'
import Dropdown from './Dropdown'
import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { integrationRequest } from '../services/integrationRequest'
import IntegrationDialog from './IntegrationDialog'
import type { ConnectionAccessModalProps } from '../types/ConnectionAccessModalProps'
export default function ConnectionAccessModal({
  connection,
  onClose,
}: ConnectionAccessModalProps) {
  const { t } = useTranslation()
  const projects = useProjects()
  const mutation = useIntegrationMutation()
  const [project, setProject] = useState('')
  const [action, setAction] = useState<'share' | 'unshare'>('share')
  const [notice, setNotice] = useState<string | null>(null)
  return (
    <IntegrationDialog
      title={t('Acceso por proyecto')}
      busy={mutation.busy}
      onClose={onClose}
    >
      <p className="mb-5 text-sm leading-relaxed text-base-content/55">
        {' '}
        {t('Comparte la conexión de')}{' '}
        <strong>{connection.remote_login}</strong>{' '}
        {t(
          'con el equipo de un proyecto o retira ese acceso compartido. Esto no inscribe ni autoriza repositorios automáticamente.',
        )}{' '}
      </p>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setNotice(null)
          void mutation.run(
            { connection: connection.id, project, action },
            async (signal, key) => {
              await integrationRequest(
                `/api/v1/git/connections/${encodeURIComponent(connection.id)}/projects/${encodeURIComponent(project)}`,
                action === 'share' ? 'POST' : 'DELETE',
                undefined,
                key,
                signal,
              )
              setNotice(
                action === 'share'
                  ? 'Acceso compartido concedido.'
                  : 'Acceso compartido retirado.',
              )
            },
          )
        }}
      >
        <label className="flex flex-col gap-2 text-sm">
          {' '}
          {t('Proyecto')}{' '}
          <Dropdown
            label={t('Proyecto')}
            value={project}
            onChange={(value) => {
              setProject(value)
              setNotice(null)
            }}
            required
            disabled={mutation.busy || projects.status !== 'ready'}
            placeholder={t('Selecciona un proyecto')}
            options={projects.projects
              .filter((project) => !project.archived)
              .map((project) => ({ value: project.id, label: project.name }))}
          />
        </label>
        {projects.status === 'loading' && (
          <p role="status" className="text-xs text-base-content/50">
            {' '}
            {t('Cargando proyectos…')}{' '}
          </p>
        )}
        {projects.status !== 'loading' && projects.status !== 'ready' && (
          <p role="alert" className="text-sm text-error">
            {' '}
            {t('No pudimos cargar los proyectos.')}{' '}
            <TextButton
              type="button"
              label={t('Reintentar')}
              onClick={projects.retry}
            >
              <RefreshCw size={16} aria-hidden="true" />
            </TextButton>
          </p>
        )}
        {projects.hasMore && (
          <IconButton
            type="button"
            variant="ghost"
            className="self-start"
            disabled={projects.loadingMore || mutation.busy}
            onClick={() => void projects.loadMore()}
            label={t('Más proyectos')}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </IconButton>
        )}
        {projects.pageError && (
          <p role="alert" className="text-xs text-error">
            {' '}
            {t('No pudimos cargar más proyectos. Vuelve a intentarlo.')}{' '}
          </p>
        )}
        <label className="flex flex-col gap-2 text-sm">
          {' '}
          {t('Acción')}{' '}
          <Dropdown
            label={t('Acción')}
            value={action}
            disabled={mutation.busy}
            onChange={(value) => {
              setAction(value as 'share' | 'unshare')
              setNotice(null)
            }}
            options={[
              { value: 'share', label: t('Compartir con el equipo') },
              { value: 'unshare', label: t('Retirar acceso compartido') },
            ]}
          />
        </label>
        {action === 'unshare' && (
          <p className="text-xs leading-relaxed text-warning">
            {' '}
            {t(
              'Los repositorios que dependan del acceso compartido pueden perder su autorización. El propietario conserva el uso de su propia conexión.',
            )}{' '}
          </p>
        )}
        {mutation.error && (
          <p role="alert" className="text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-success">
            {t(notice)}
          </p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <TextButton
            type="button"
            variant="ghost"
            disabled={mutation.busy}
            onClick={onClose}
            label={t('Cerrar')}
          >
            <X size={16} aria-hidden="true" />
          </TextButton>
          <TextButton
            type="submit"
            variant="primary"
            disabled={mutation.busy || !project}
            label={mutation.busy ? t('Guardando…') : t('Confirmar acceso')}
            aria-busy={mutation.busy}
          >
            <Check size={16} aria-hidden="true" />
          </TextButton>
        </div>
      </form>
    </IntegrationDialog>
  )
}
