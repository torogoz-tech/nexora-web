export function integrationError(status: number): Error {
  const messages: Record<number, string> = {
    401: 'La sesión o la autorización ya no están disponibles. Vuelve a iniciar el proceso.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'El proveedor o la conexión no están disponibles.',
    409: 'La configuración cambió. Actualiza los datos antes de volver a intentarlo.',
    422: 'Revisa los datos y la URL de retorno permitida por tu instalación.',
    429: 'Hay demasiadas solicitudes. Espera un momento y vuelve a intentarlo.',
  }
  return new Error(
    messages[status] ??
      'No pudimos completar la operación. Revisa la conexión y vuelve a intentarlo.',
  )
}
