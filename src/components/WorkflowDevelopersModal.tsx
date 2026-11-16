import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import IconButton from './IconButton'
import { useState } from 'react'
import RowAction from './RowAction'
import DeveloperWorkflowRemovalModal from './DeveloperWorkflowRemovalModal'
import type { DeveloperWorkflowAssignment } from '../types/DeveloperWorkflowAssignment'
import {
  ChevronRight,
  ChevronLeft,
  Link2,
  UsersRound,
  Unlink,
} from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseDeveloperWorkflowMembers } from '../utils/parseDeveloperWorkflowMembers'
import { parseDeveloperDirectoryPage } from '../utils/parseDeveloperDirectoryPage'
import { assignDeveloperWorkflow } from '../services/assignDeveloperWorkflow'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import DataMessage from './DataMessage'
import type { WorkflowDevelopersModalProps } from '../types/WorkflowDevelopersModalProps'
export default function WorkflowDevelopersModal({
  workflow,
  onClose,
}: WorkflowDevelopersModalProps) {
  const { t } = useTranslation()
  const [after, setAfter] = useState(''),
    [actor, setActor] = useState('')
  const members = useApiData(
    `/api/v1/workflows/${encodeURIComponent(workflow.id)}/developers`,
    parseDeveloperWorkflowMembers,
  )
  const directory = useApiData(
    workflow.latest_version_id && !workflow.archived
      ? `/api/v1/developers?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`
      : null,
    parseDeveloperDirectoryPage,
  )
  const [removing, setRemoving] = useState<DeveloperWorkflowAssignment | null>(
    null,
  )
  const mutation = useIntegrationMutation()
  const selected = directory.data?.items.find((item) => item.id === actor)
  const assignmentRevision=selected?.role&&selected.role!=='developer'?(selected.workflows?.find(item=>item.workflow_id===workflow.id)?.revision??0):(selected?.assignment_revision??0)
  return (
    <>
      <IntegrationDialog
        title={t('Desarrolladores · {0}', { '0': workflow.name })}
        busy={mutation.busy}
        onClose={onClose}
      >
        <p className="mb-4 text-sm leading-relaxed text-base-content/55">
          {' '}
          {t(
            'Los desarrolladores tienen un workflow. Líderes técnicos, PMO, gerentes y superadministradores pueden tener varios.',
          )}{' '}
        </p>
        {members.loading || members.error ? (
          <DataMessage
            loading={members.loading}
            error={t(members.error)}
            onRetry={members.reload}
          />
        ) : members.data?.length ? (
          <ul className="mb-5 divide-y divide-base-300">
            {members.data.map((member) => (
              <li
                key={member.actor_id}
                className="flex items-center gap-3 py-3"
              >
                <UsersRound
                  size={16}
                  className="shrink-0 text-base-content/45"
                />
                <span className="min-w-0 flex-1 break-words text-sm">
                  {member.actor_name}
                </span>
                <span className="text-xs text-base-content/45">
                  {member.workflow_version_id === workflow.latest_version_id
                    ? t('Versión actual')
                    : t('Versión anterior')}
                </span>
                <RowAction
                  label={t('Desvincular {0}', { '0': member.actor_name })}
                  onClick={() => setRemoving(member)}
                >
                  <Unlink size={15} aria-hidden="true" />
                </RowAction>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-5 text-sm text-base-content/50">
            {' '}
            {t('Todavía no hay desarrolladores vinculados.')}{' '}
          </p>
        )}
        {!workflow.latest_version_id || workflow.archived ? (
          <p className="rounded-xl border border-base-300 p-4 text-sm text-base-content/55">
            {workflow.archived
              ? t('Restaura el workflow para vincular desarrolladores.')
              : t('Publica una versión para vincular desarrolladores.')}
          </p>
        ) : (
          <form
            className="space-y-4 rounded-xl border border-base-300 p-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (!selected || !workflow.latest_version_id)
                return
              void mutation.run(
                {
                  actor,
                  version: workflow.latest_version_id,
                  revision: assignmentRevision,
                },
                async (signal, key) => {
                  await assignDeveloperWorkflow(
                    actor,
                    workflow.latest_version_id!,
                    assignmentRevision,
                      key,
                    signal,
                  )
                  members.reload()
                  directory.reload()
                  setActor('')
                },
              )
            }}
          >
            <label className="flex flex-col gap-2 text-xs">
              {' '}
              {t('Desarrollador')}{' '}
              <Dropdown
                label={t('Desarrollador')}
                value={actor}
                onChange={setActor}
                options={(directory.data?.items ?? []).map((item) => ({
                  value: item.id,
                  label:
                    item.name +
                    (item.workflow_id && item.workflow_id !== workflow.id
                      ? t(' · En otro workflow')
                      : ''),
                }))}
                placeholder={t('Selecciona un desarrollador')}
                disabled={directory.loading || mutation.busy}
                required
              />
            </label>
            {directory.error && (
              <DataMessage
                error={t(directory.error)}
                onRetry={directory.reload}
              />
            )}
            {directory.data?.next_after && (
              <IconButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setAfter(directory.data!.next_after!)
                  setActor('')
                }}
                label={t('Ver siguientes desarrolladores')}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </IconButton>
            )}
            {after && (
              <IconButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setAfter('')
                  setActor('')
                }}
                label={t('Volver al inicio')}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </IconButton>
            )}
            <p className="text-xs text-base-content/45">
              {' '}
              {t('Se usará la versión publicada v')}
              {workflow.latest_version_number}{' '}
              {t('para sus nuevas tareas.')}{' '}
            </p>

            {mutation.error && (
              <p role="alert" className="text-sm text-error">
                {t(mutation.error)}
              </p>
            )}
            <div className="flex justify-end">
              <TextButton
                type="submit"
                variant="primary"
                disabled={!selected || mutation.busy}
                label={
                  mutation.busy ? t('Vinculando…') : t('Vincular desarrollador')
                }
                aria-busy={mutation.busy}
              >
                <Link2 size={16} aria-hidden="true" />
              </TextButton>
            </div>
          </form>
        )}
      </IntegrationDialog>
      {removing && (
        <DeveloperWorkflowRemovalModal
          assignment={removing}
          onClose={() => setRemoving(null)}
          onRemoved={() => {
            members.reload()
            directory.reload()
            setActor('')
          }}
        />
      )}
    </>
  )
}
