export function serviceRequestStatus(status: string) {
  return status === 'new' ? 'Nuevo' : status === 'in_progress' ? 'En progreso' : 'Finalizado'
}
