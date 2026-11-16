import { validTaskAcceptanceCriteria } from './validTaskAcceptanceCriteria'
import type { BoardTaskInput } from '../types/BoardTaskInput'
export function prepareBoardTaskInput(input: BoardTaskInput): BoardTaskInput {
  const result = { ...input, title: input.title.trim(), context: input.context.trim(), projectId: input.projectId || null, assigneeId: input.assigneeId || null }
  const bytes = (text: string) => new TextEncoder().encode(text).length
  if (!result.title || bytes(result.title) > 256) throw Error('El título es obligatorio y admite hasta 256 bytes.')
  if (bytes(result.context) > 8000) throw Error('El contexto admite hasta 8000 bytes.')
  if (!result.typeCode.trim() || [result.projectId, result.assigneeId, result.typeCode].some(value => value != null && bytes(value) > 128) || !['low', 'medium', 'high', 'critical'].includes(result.priority)) throw Error('Revisa los campos de la tarea.')
  if (!validTaskAcceptanceCriteria(input.acceptanceCriteria??[])) throw Error('Revisa los criterios de aceptación.')
  if(input.subtaskWork?.workKind==='corrective'&&(!input.projectId||!input.subtaskWork.testedRepositoryId||!/^(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(input.subtaskWork.testedCommitSha??'')))throw Error('Una corrección requiere un repositorio y el commit completo probado.')
  return {...result,acceptanceCriteria:input.acceptanceCriteria?.map(value=>value.trim())}
}
