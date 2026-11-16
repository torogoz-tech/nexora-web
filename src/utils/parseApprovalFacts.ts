export function parseApprovalFacts(value: unknown) {
  if (!value || typeof value !== 'object' || !('revision' in value) || typeof value.revision !== 'number' || !('from_state' in value) || typeof value.from_state !== 'string' || !('to_state' in value) || typeof value.to_state !== 'string' || !('reason' in value) || typeof value.reason !== 'string' || !('status' in value) || typeof value.status !== 'string') throw Error('Respuesta de aprobaciones no válida.')
  return { revision: value.revision, from: value.from_state, to: value.to_state, reason: value.reason, status: value.status }
}
