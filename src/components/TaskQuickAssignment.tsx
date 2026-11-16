import { useContext, useState } from 'react'
import { Play, UserRoundPlus } from 'lucide-react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { taskPoolActions } from '../utils/taskPoolActions'
import { mutatePoolTask } from '../services/mutatePoolTask'
import type { VisibleTask } from '../types/VisibleTask'
import IconButton from './IconButton'
import TextButton from './TextButton'
import ReassignDeveloperTaskModal from './ReassignDeveloperTaskModal'
import TakeTaskWorkflowModal from './TakeTaskWorkflowModal'
export default function TaskQuickAssignment({
  task,
  onChanged,
}: {
  task: VisibleTask
  onChanged: () => void
}) {
  const { t } = useTranslation(),
    { session } = useAuth(),
    permissions = useContext(WorkspacePermissionsContext),
    mutation = useIntegrationMutation()
  const [assigning, setAssigning] = useState(false),
    [taking, setTaking] = useState(false)
  const actions = taskPoolActions(
    task,
    session?.actorId,
    permissions?.role ?? null,
    permissions?.grants ?? [],
  )
  const coordinator =
    !!permissions?.role &&
    ['technical_lead', 'pmo', 'manager', 'super_admin'].includes(
      permissions.role,
    )
  if (task.archived || task.lifecycle !== 'pending')
    return <span>{t('Sin responsable')}</span>
  return (
    <>
      <div className="flex items-center gap-1">
        {actions.take && (
          <IconButton
            label={t('Tomar tarea e iniciar workflow')}
            disabled={mutation.busy || task.blocked}
            onClick={() => {
              if (task.purpose !== 'general') setTaking(true)
              else
                void mutation.run(
                  { id: task.id, revision: task.revision, operation: 'take' },
                  async (signal, key) => {
                    await mutatePoolTask(
                      task,
                      'take',
                      session!.actorId,
                      key,
                      signal,
                    )
                    onChanged()
                  },
                )
            }}
          >
            <Play size={15} />
          </IconButton>
        )}
        {coordinator && actions.assign && (
          <TextButton
            label={t('Asignar')}
            disabled={mutation.busy}
            onClick={() => setAssigning(true)}
          >
            <UserRoundPlus size={15} />
          </TextButton>
        )}
        {!actions.take && !(coordinator && actions.assign) && (
          <span>{t('Sin responsable')}</span>
        )}
      </div>
      {mutation.error && (
        <p role="alert" className="mt-1 max-w-52 text-xs text-error">
          {t(mutation.error)}
        </p>
      )}
      {assigning && (
        <ReassignDeveloperTaskModal
          task={task}
          workflowId={task.workflow_id ?? ''}
          onClose={() => setAssigning(false)}
          onChanged={onChanged}
        />
      )}
      {taking && session && (
        <TakeTaskWorkflowModal
          task={task}
          actorId={session.actorId}
          onClose={() => setTaking(false)}
          onChanged={() => {
            setTaking(false)
            onChanged()
          }}
        />
      )}
    </>
  )
}
