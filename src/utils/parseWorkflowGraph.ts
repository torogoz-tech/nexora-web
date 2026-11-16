import { parseWorkflowSteps } from './parseWorkflowSteps'
import { requireRecord } from './requireRecord'
import { workflowGuardOptions } from '../app/workflowGuardOptions'
import type { WorkflowGraph } from '../types/WorkflowGraph'
import type { WorkflowGuard } from '../types/WorkflowGuard'
export function parseWorkflowGraph(value: unknown): WorkflowGraph {
  const v = requireRecord(value)
  if (
    Object.keys(v).some((key) => !['states', 'transitions'].includes(key)) ||
    !Array.isArray(v.states) ||
    !Array.isArray(v.transitions) ||
    v.states.length > 64 ||
    v.transitions.length > 256
  )
    throw new Error('El gráfico del workflow no es válido.')
  return {
    states: v.states.map((value) => {
      const state = requireRecord(value)
      if (
        Object.keys(state).some(
          (key) =>
            ![
              'id',
              'name',
              'color',
              'initial',
              'terminal',
              'publishable',
              'required_base_branch',
              'progress_order',
              'prevent_backtracking',
            ].includes(key),
        ) ||
        typeof state.id !== 'string' ||
        typeof state.name !== 'string' ||
        ['initial', 'terminal', 'publishable', 'prevent_backtracking'].some(
          (key) => state[key] !== undefined && typeof state[key] !== 'boolean',
        ) ||
        (state.required_base_branch !== undefined && typeof state.required_base_branch !== 'string') ||
        (state.progress_order !== undefined && (!Number.isSafeInteger(state.progress_order) || Number(state.progress_order) < 0)) ||
        (state.color !== undefined &&
          (typeof state.color !== 'string' ||
            !/^#[A-Fa-f0-9]{6}$/.test(state.color)))
      )
        throw new Error('Un estado del workflow no es válido.')
      return {
        id: state.id,
        name: state.name,
        ...(state.required_base_branch !== undefined ? {required_base_branch: String(state.required_base_branch)} : {}),
        ...(state.progress_order !== undefined ? {progress_order: Number(state.progress_order)} : {}),
        ...(state.prevent_backtracking !== undefined ? {prevent_backtracking: Boolean(state.prevent_backtracking)} : {}),
        ...(state.color !== undefined ? { color: String(state.color) } : {}),
        ...(state.initial !== undefined
          ? { initial: Boolean(state.initial) }
          : {}),
        ...(state.terminal !== undefined
          ? { terminal: Boolean(state.terminal) }
          : {}),
        ...(state.publishable !== undefined
          ? { publishable: Boolean(state.publishable) }
          : {}),
      }
    }),
    transitions: v.transitions.map((value) => {
      const edge = requireRecord(value)
      if (
        Object.keys(edge).some(
          (key) => !['id', 'name', 'from', 'to', 'guards', 'steps', 'automatic'].includes(key),
        ) ||
        (edge.automatic !== undefined && typeof edge.automatic !== 'boolean') ||
        (edge.name !== undefined && typeof edge.name !== 'string') ||
        !['id', 'from', 'to'].every(
          (key) => typeof edge[key] === 'string',
        ) ||
        (edge.guards !== undefined && !Array.isArray(edge.guards))
      )
        throw new Error('Una transición del workflow no es válida.')
      const guards = (edge.guards ?? []) as unknown[]
      if (guards.length > 32)
        throw new Error('Demasiadas condiciones en una transición.')
      return {
        ...(edge.automatic===undefined?{}:{automatic:edge.automatic as boolean}),
        id: String(edge.id),
        name: typeof edge.name === 'string' ? edge.name : '',
        ...(edge.steps !== undefined ? {steps: parseWorkflowSteps(edge.steps)} : {}),
        from: String(edge.from),
        to: String(edge.to),
        guards: guards.map((value) => {
          const guard = requireRecord(value)
          if (
            Object.keys(guard).some(
              (key) =>
                !(
                  guard.kind === 'required_field' ? ['kind', 'field'] : ['kind']
                ).includes(key),
            )
          )
            throw new Error(
              'La condición contiene propiedades desconocidas. Actualiza la aplicación antes de editar este workflow.',
            )
          if (
            guard.kind === 'required_field' &&
            typeof guard.field === 'string'
          )
            return { kind: 'required_field', field: guard.field }
          if (
            !workflowGuardOptions.some((option) => option.value === guard.kind)
          )
            throw new Error(
              'La API devolvió una condición desconocida. Actualiza la aplicación antes de editar este workflow.',
            )
          return { kind: guard.kind } as WorkflowGuard
        }),
      }
    }),
  }
}
