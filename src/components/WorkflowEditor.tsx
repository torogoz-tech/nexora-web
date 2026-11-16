import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../hooks/useAuth'
import { getWorkflowCanvasKey } from '../utils/getWorkflowCanvasKey'
import { transferWorkflowCanvasPositions } from '../utils/transferWorkflowCanvasPositions'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  Save,
  Plus,
  ArrowUpRight,
  Send,
  Archive,
  ArchiveRestore,
  RefreshCw,
  History,
} from 'lucide-react'
import { createWorkflowInput } from '../utils/createWorkflowInput'
import { validateWorkflowInput } from '../utils/validateWorkflowInput'
import { parseWorkflowDefinition } from '../utils/parseWorkflowDefinition'
import { parseWorkflowVersion } from '../utils/parseWorkflowVersion'
import { mutateWorkflow } from '../services/mutateWorkflow'
import { useIntegrationMutation as useApiMutation } from '../hooks/useIntegrationMutation'
import { useUnsavedWorkflow } from '../hooks/useUnsavedWorkflow'
import WorkflowCanvas from './WorkflowCanvas'
import WorkflowColorPicker from './WorkflowColorPicker'
import WorkflowIconPicker from './WorkflowIconPicker'
import RowAction from './RowAction'
import WorkflowStateEditor from './WorkflowStateEditor'
import WorkflowTransitionEditor from './WorkflowTransitionEditor'
import WorkflowPropertiesModal from './WorkflowPropertiesModal'
import WorkflowReasonModal from './WorkflowReasonModal'
import WorkflowArchiveModal from './WorkflowArchiveModal'
import type { WorkflowDefinition } from '../types/WorkflowDefinition'
import type { WorkflowInput } from '../types/WorkflowInput'
import type { WorkflowState } from '../types/WorkflowState'
import type { WorkflowEditorProps } from '../types/WorkflowEditorProps'
export default function WorkflowEditor({
  workflow,
  focus,
  onReload,
}: WorkflowEditorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const mutation = useApiMutation()
  const [saved, setSaved] = useState(workflow)
  const [input, setInput] = useState<WorkflowInput>(() =>
    workflow
      ? {
          name: workflow.name,
          icon: workflow.icon ?? 'workflow',
      color: workflow.color ?? '',
          purpose: workflow.purpose,
          resource_kinds: workflow.resource_kinds,
          graph: workflow.draft,
        }
      : createWorkflowInput(),
  )
  const [selected, setSelected] = useState(
    focus?.kind === 'state' ? focus.id : input.graph.states.find((state) => state.initial)?.id ??
      input.graph.states[0]?.id ??
      '',
  )
  const [propertiesOpen, setPropertiesOpen] = useState(!!focus)
  const [inspector, setInspector] = useState<'state' | 'transition'>(focus?.kind ?? 'state')
  const [selectedTransition, setSelectedTransition] = useState(
    focus?.kind === 'transition' ? focus.id : workflow?.draft.transitions[0]?.id ?? '',
  )
  const [action, setAction] = useState<'save' | 'publish' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const baseline = saved
    ? {
        name: saved.name,
        icon: saved.icon ?? 'workflow',
      color: saved.color ?? '',
        purpose: saved.purpose,
        resource_kinds: saved.resource_kinds,
        graph: saved.draft,
      }
    : createWorkflowInput()
  const dirty = JSON.stringify(input) !== JSON.stringify(baseline)
  useUnsavedWorkflow(dirty)
  const problems = validateWorkflowInput(input)
  const disabled = mutation.busy || !!saved?.archived
  const state =
    input.graph.states.find((state) => state.id === selected) ??
    input.graph.states[0]
  const base = `/api/v1/workflows${saved ? `/${encodeURIComponent(saved.id)}` : ''}`
  const returnPath = focus ? basePath() : '/settings/workflows'
  const propertyPath = (kind: 'state' | 'transition', id: string) => `${basePath()}/${kind === 'state' ? 'states' : 'transitions'}/${encodeURIComponent(id)}`
  function basePath() {
    return `/settings/workflows/${encodeURIComponent(saved?.id ?? workflow?.id ?? '')}`
  }
  const canvasKey = getWorkflowCanvasKey(
    session?.actorId ?? 'anonymous',
    'global',
    saved?.id ?? 'new',
  )
  const edge =
    input.graph.transitions.find((edge) => edge.id === selectedTransition) ??
    input.graph.transitions[0]
  function selectTransition(id: string) {
    setSelectedTransition(id)
    setInspector('transition')
  }
  function connect(from: string, to: string) {
    if (
      disabled ||
      !input.graph.states.some((state) => state.id === from) ||
      !input.graph.states.some((state) => state.id === to)
    )
      return
    const existing = input.graph.transitions.find(
      (edge) => edge.from === from && edge.to === to,
    )
    if (existing) {
      selectTransition(existing.id)
      return
    }
    addTransition(from, to)
  }
  function addTransition(
    from = state?.id ?? input.graph.states[0]?.id,
    to = input.graph.states.find((item) => item.id !== from)?.id ?? from,
  ) {
    if (disabled || !from || !to || input.graph.transitions.length >= 256)
      return
    const id = `transition_${crypto.randomUUID().slice(0, 8)}`
    const name = ''
    setInput((value) => ({
      ...value,
      graph: {
        ...value.graph,
        transitions: [
          ...value.graph.transitions,
          { id, name, from, to, guards: [] },
        ],
      },
    }))
    selectTransition(id)
    navigate(propertyPath('transition', id))
  }
  function accept(value: WorkflowDefinition) {
    setSaved(value)
    setInput({
      name: value.name,
      icon: value.icon ?? 'workflow',
      color: value.color ?? '',
      purpose: value.purpose,
      resource_kinds: value.resource_kinds,
      graph: value.draft,
    })
    setShowErrors(false)
  }
  function changeState(patch: Partial<WorkflowState>) {
    if (!state) return
    setInput((value) => ({
      ...value,
      graph: {
        ...value.graph,
        states: value.graph.states.map((item) =>
          item.id === state.id
            ? { ...item, ...patch }
            : patch.initial
              ? { ...item, initial: false }
              : item,
        ),
      },
    }))
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || (saved && !dirty)) return
    setShowErrors(true)
    setNotice(null)
    if (problems.length) return
    if (saved) setAction('save')
    else void save()
  }
  async function save(reason = '') {
    if (disabled || (saved && !dirty)) return
    setShowErrors(true)
    setNotice(null)
    if (problems.length || (saved && !reason.trim())) return
    const definition = {
      graph: input.graph,
      name: input.name.trim(),
      icon: input.icon ?? 'workflow',
      color: input.color ?? '',
      purpose: input.purpose.trim(),
    }
    const payload = saved
      ? {
          ...definition,
          expected_revision: saved.revision,
          reason: reason.trim(),
        }
      : definition
    await mutation.run({ base, payload }, async (signal, key) => {
      const value = parseWorkflowDefinition(
        await mutateWorkflow(
          base,
          saved ? 'PATCH' : 'POST',
          payload,
          key,
          signal,
        ),
      )
      if (saved && value.id !== saved.id)
        throw new Error('La API devolvió otro workflow.')
      if (!saved)
        transferWorkflowCanvasPositions(
          canvasKey,
          getWorkflowCanvasKey(
            session?.actorId ?? 'anonymous',
            'global',
            value.id,
          ),
        )
      accept(value)
      setAction(null)
      if (!saved)
        navigate(`/settings/workflows/${encodeURIComponent(value.id)}`, {
          replace: true,
        })
      else setNotice('Borrador guardado.')
    })
  }
  async function publish(reason: string) {
    if (!saved || disabled || dirty || problems.length || !reason.trim()) return
    setNotice(null)
    const payload = {
      expected_revision: saved.revision,
      reason: reason.trim(),
    }
    await mutation.run(
      { base, action: 'publish', payload },
      async (signal, key) => {
        const version = parseWorkflowVersion(
          await mutateWorkflow(`${base}/publish`, 'POST', payload, key, signal),
        )
        if (version.workflow_id !== saved.id)
          throw new Error('La API devolvió una publicación de otro workflow.')
        setSaved((value) =>
          value
            ? {
                ...value,
                revision: value.revision + 1,
                latest_version_id: version.id,
                latest_version_number: version.number,
              }
            : value,
        )
        setAction(null)
        setNotice(t('Versión {0} publicada.', { '0': version.number }))
      },
    )
  }
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={returnPath}
          className="inline-flex items-center gap-2 text-xs text-base-content/55 hover:text-base-content"
        >
          <ArrowLeft size={14} /> {t('Volver a workflows')}{' '}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-base-content/45">
            {dirty
              ? t('Cambios sin guardar')
              : saved
                ? t('Revisión {0}', { '0': saved.revision })
                : t('Nuevo borrador')}
          </span>
          {saved && (
            <>
              <RowAction
                to={`/settings/workflows/${encodeURIComponent(saved.id)}/versions`}
                label={t('Ver versiones publicadas')}
              >
                <History size={14} />
              </RowAction>
              <RowAction
                label={t('Recargar workflow')}
                disabled={mutation.busy}
                onClick={() => {
                  if (
                    !dirty ||
                    window.confirm(
                      t(
                        'Se descartarán los cambios sin guardar. ¿Quieres recargar el workflow?',
                      ),
                    )
                  )
                    onReload()
                }}
              >
                <RefreshCw size={15} />
              </RowAction>
              <RowAction
                label={saved.archived ? t('Restaurar') : t('Archivar')}
                disabled={mutation.busy || dirty}
                onClick={() => setArchiveOpen(true)}
              >
                {saved.archived ? (
                  <ArchiveRestore size={14} />
                ) : (
                  <Archive size={14} />
                )}
              </RowAction>
            </>
          )}
        </div>
      </div>
      <form onSubmit={submit} className="min-w-0" aria-busy={mutation.busy}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">
              {saved ? t('Editar workflow') : t('Crear workflow')}
            </h1>
            <p className="mt-1 text-xs text-base-content/45">
              {saved?.latest_version_number
                ? t('Publicada v{0}', { '0': saved.latest_version_number })
                : ''}
              {saved?.archived ? t(' · Archivado') : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {saved && (
              <RowAction
                label={t('Publicar versión')}
                variant="outline"
                disabled={disabled || dirty || problems.length > 0}
                hint={
                  dirty ? t('Guarda el borrador antes de publicar.') : undefined
                }
                onClick={() => setAction('publish')}
              >
                <Send size={14} />
              </RowAction>
            )}
            <RowAction
              type="submit"
              variant="primary"
              label={
                mutation.busy
                  ? t('Guardando…')
                  : saved
                    ? t('Guardar borrador')
                    : t('Crear workflow')
              }
              disabled={disabled || (!!saved && !dirty)}
            >
              <Save size={15} />
            </RowAction>
          </div>
        </div>
        {saved?.archived && (
          <p className="mb-5 rounded-xl border border-base-300 p-4 text-sm text-base-content/60">
            {' '}
            {t(
              'Este workflow está archivado. Puedes consultar sus versiones o restaurarlo para editarlo.',
            )}{' '}
          </p>
        )}
        <fieldset disabled={disabled} className="mb-6 grid min-w-0 gap-5">
          <div className="flex min-w-0 items-end gap-3">
          <WorkflowIconPicker value={input.icon ?? 'workflow'} disabled={disabled} onChange={icon => setInput(value => ({ ...value, icon }))}/>
          <WorkflowColorPicker value={input.color || undefined} disabled={disabled} onChange={color => setInput(value => ({ ...value, color:color ?? '' }))}/>
          <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs">
            {' '}
            {t('Nombre del workflow')}{' '}
            <input
              className="input w-full"
              required
              maxLength={160}
              value={input.name}
              onChange={(event) =>
                setInput((value) => ({ ...value, name: event.target.value }))
              }
            />
          </label>
          </div>
          <label className="flex min-w-0 flex-col gap-2 text-xs">
            <span className="flex items-center justify-between gap-2">
              <span>{t('Propósito')}</span>
              <span className="text-[11px] text-base-content/40">
                {t('Opcional')}
              </span>
            </span>
            <textarea
              aria-label={t('Propósito')}
              placeholder={t('Describe para qué se utilizará este workflow.')}
              rows={2}
              className="textarea min-h-20 w-full"
              maxLength={4000}
              value={input.purpose}
              onChange={(event) =>
                setInput((value) => ({ ...value, purpose: event.target.value }))
              }
            />
          </label>
        </fieldset>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">
            {t('Estados y transiciones')}
          </h2>
          <div className="flex flex-wrap justify-end gap-1">
            <RowAction
              label={t('Agregar transición')}
              disabled={disabled || input.graph.transitions.length >= 256}
              onClick={() => {
                addTransition()
                setPropertiesOpen(true)
              }}
            >
              <ArrowUpRight size={15} />
            </RowAction>
            <RowAction
              label={t('Agregar estado')}
              disabled={
                disabled ||
                input.graph.states.length >= 64 ||
                input.graph.transitions.length >= 256
              }
              onClick={() => {
                const id = `state_${crypto.randomUUID().slice(0, 8)}`
                const from = state?.id ?? input.graph.states[0]?.id
                if (!from) return
                setInput((value) => ({
                  ...value,
                  graph: {
                    states: [
                      ...value.graph.states,
                      { id, name: t('Nuevo estado') },
                    ],
                    transitions: [
                      ...value.graph.transitions,
                      {
                        id: `transition_${crypto.randomUUID().slice(0, 8)}`,
                        name: '',
                        from,
                        to: id,
                        guards: [],
                      },
                    ],
                  },
                }))
                setSelected(id)
                setInspector('state')
                navigate(propertyPath('state', id))
              }}
            >
              <Plus size={15} />
            </RowAction>
          </div>
        </div>
        <div className="min-w-0">
          <WorkflowCanvas
            key={canvasKey}
            layoutKey={canvasKey}
            graph={input.graph}
            selectedId={inspector === 'state' ? (state?.id ?? '') : ''}
            selectedTransitionId={
              inspector === 'transition' ? edge?.id : undefined
            }
            onSelect={(id) => {
              setSelected(id)
              setInspector('state')
            }}
            onSelectTransition={selectTransition}
            onEditState={(id) => {
              setSelected(id)
              setInspector('state')
              navigate(propertyPath('state', id))
            }}
            onEditTransition={(id) => {
              selectTransition(id)
              navigate(propertyPath('transition', id))
            }}
            onConnect={connect}
            readOnly={disabled}
          />
        </div>
        {showErrors && problems.length > 0 && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-error/30 p-4 text-sm text-error"
          >
            <p className="font-medium">
              {' '}
              {t('Revisa el workflow antes de guardarlo:')}{' '}
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {problems.map((problem) => (
                <li key={problem}>{t(problem)}</li>
              ))}
            </ul>
          </div>
        )}
        {mutation.error && !action && (
          <p role="alert" className="mt-5 text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-5 text-sm text-success">
            {t(notice)}
          </p>
        )}
      </form>
      {propertiesOpen && (
        <WorkflowPropertiesModal
          kind={inspector}
          fullPage={!!focus}
          name={
            inspector === 'state' ? (state?.name ?? '') : edge?.automatic ? `${input.graph.states.find((item) => item.id === edge.from)?.name ?? ''} · ${t('Acciones finales')}` : `${input.graph.states.find((item) => item.id === edge?.from)?.name ?? ''} → ${input.graph.states.find((item) => item.id === edge?.to)?.name ?? ''}`
          }
          onClose={() => focus ? navigate(returnPath) : setPropertiesOpen(false)}
        >
          {inspector === 'state' && state ? (
            <WorkflowStateEditor
              state={state}
              disabled={disabled}
              canDelete={input.graph.states.length > 1 && !state.initial}
              onChange={changeState}
              onDelete={() => {
                if (!state || state.initial) return
                setInput((value) => ({
                  ...value,
                  graph: {
                    states: value.graph.states.filter(
                      (item) => item.id !== state.id,
                    ),
                    transitions: value.graph.transitions.filter(
                      (edge) => edge.from !== state.id && edge.to !== state.id,
                    ),
                  },
                }))
                setPropertiesOpen(false)
                if (focus) navigate(returnPath)
                setSelected(
                  input.graph.states.find((item) => item.initial)?.id ?? '',
                )
              }}
            />
          ) : (
            <WorkflowTransitionEditor
              graph={input.graph}
              selectedId={edge?.id ?? ''}
              disabled={disabled}
              taskOnly={
                input.resource_kinds.length === 1 &&
                input.resource_kinds[0] === 'task'
              }
              onChange={(graph) => {
                setInput((value) => ({ ...value, graph }))
                if (
                  !graph.transitions.some(
                    (transition) => transition.id === edge?.id,
                  )
                ) {
                  if (focus) {
                    navigate(returnPath)
                  } else {
                    setPropertiesOpen(false)
                  }
                }
              }}
            />
          )}
        </WorkflowPropertiesModal>
      )}
      {action && (
        <WorkflowReasonModal
          action={action}
          busy={mutation.busy}
          error={t(mutation.error)}
          onClose={() => setAction(null)}
          onConfirm={action === 'save' ? save : publish}
        />
      )}
      {archiveOpen && saved && (
        <WorkflowArchiveModal
          workflow={saved}
          onClose={() => setArchiveOpen(false)}
          onChanged={accept}
        />
      )}
    </>
  )
}
