import { validateWorkflowRules } from './validateWorkflowRules'
import type { WorkflowInput } from '../types/WorkflowInput'
import { workflowResourceOptions } from '../app/workflowResourceOptions'
import { workflowGuardOptions } from '../app/workflowGuardOptions'
import { workflowIcons } from '../app/workflowIcons'
export function validateWorkflowInput(input: WorkflowInput): string[] {
  const errors: string[] = []
  if (input.color && !/^#[A-Fa-f0-9]{6}$/.test(input.color)) errors.push('El color del workflow no es válido.')
  if (input.icon !== undefined && !workflowIcons.some(option => option.value === input.icon)) errors.push('El icono del workflow no es válido.')
  const bytes = (value: string) => new TextEncoder().encode(value).length
  const key = (value: string) => /^[A-Za-z0-9_-]{1,64}$/.test(value)
  const control = (value: string, whitespace = false) =>
    Array.from(value).some((char) => {
      const code = char.codePointAt(0)!
      return (
        (code < 32 || (code >= 127 && code <= 159)) &&
        !(whitespace && (code === 9 || code === 10))
      )
    })
  const name = (value: string) =>
    !!value.trim() && bytes(value) <= 160 && !control(value)
  if (!name(input.name.trim()))
    errors.push('El nombre es obligatorio y admite hasta 160 bytes.')
  if (bytes(input.purpose.trim()) > 4000 || control(input.purpose, true))
    errors.push(
      'El propósito admite hasta 4000 bytes y no debe incluir caracteres de control.',
    )
  const kinds = input.resource_kinds
  if (
    !kinds.length ||
    new Set(kinds).size !== kinds.length ||
    kinds.some(
      (kind) =>
        !workflowResourceOptions.some((option) => option.value === kind),
    )
  )
    errors.push(
      'Selecciona al menos un tipo de recurso válido, sin duplicados.',
    )
  const { states, transitions } = input.graph
  if (states.length < 1 || states.length > 64)
    errors.push('El workflow necesita entre 1 y 64 estados.')
  if (transitions.length > 256)
    errors.push('El workflow necesita hasta 256 conexiones.')
  if (states.filter((state) => state.initial).length !== 1)
    errors.push('Debe existir exactamente un estado inicial.')
  const ids = new Set(states.map((state) => state.id))
  if (
    ids.size !== states.length ||
    states.some(
      (state) =>
        !key(state.id) ||
        !name(state.name) ||
        (state.color !== undefined && !/^#[A-Fa-f0-9]{6}$/.test(state.color)),
    )
  )
    errors.push('Revisa los identificadores, nombres y colores de los estados.')
  if (
    new Set(transitions.map((edge) => edge.id)).size !== transitions.length ||
    transitions.some(
      (edge) =>
        !key(edge.id) ||
        (edge.name !== '' && !name(edge.name)) ||
        !ids.has(edge.from) ||
        !ids.has(edge.to),
    )
  )
    errors.push(
      'Revisa los nombres, identificadores y estados de las transiciones.',
    )
  for (const edge of transitions) {
    if (
      edge.guards.length > 32 ||
      new Set(
        edge.guards.map((guard) =>
          guard.kind === 'required_field'
            ? `required_field:${guard.field}`
            : guard.kind,
        ),
      ).size !== edge.guards.length
    )
      errors.push(
        `La transición «${edge.name}» tiene condiciones repetidas o demasiadas condiciones.`,
      )
    if (
      edge.guards.some((guard) =>
        guard.kind === 'required_field'
          ? !/^[A-Za-z0-9_]{1,64}$/.test(guard.field)
          : !workflowGuardOptions.some((option) => option.value === guard.kind),
      )
    )
      errors.push(`Revisa las condiciones de «${edge.name}».`)
    if (
      edge.guards.some((guard) => guard.kind === 'working_branch_reported') &&
      (kinds.length !== 1 || kinds[0] !== 'task')
    )
      errors.push(
        'La condición de rama reportada solo admite workflows exclusivos de tareas.',
      )
  }
  const reached = new Set<string>()
  const pending = states
    .filter((state) => state.initial)
    .map((state) => state.id)
  while (pending.length) {
    const id = pending.pop()!
    if (reached.has(id)) continue
    reached.add(id)
    for (const edge of transitions)
      if (edge.from === id && ids.has(edge.to) && !reached.has(edge.to))
        pending.push(edge.to)
  }
  if (states.some((state) => !reached.has(state.id)))
    errors.push(
      'Todos los estados deben ser alcanzables desde el estado inicial.',
    )
  if (bytes(JSON.stringify(input.graph)) > 262144)
    errors.push('El gráfico supera el tamaño permitido por la API.')
  errors.push(...validateWorkflowRules(input.graph))
  return [...new Set(errors)]
}
