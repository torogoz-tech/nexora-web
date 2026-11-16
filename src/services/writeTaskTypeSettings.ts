import { apiFetch } from './apiFetch'
export async function writeTaskTypeSettings(
  path: string,
  method: 'POST' | 'PUT',
  input: unknown,
  key: string,
  signal: AbortSignal,
) {
  const response = await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(input),
    signal,
  })
  if (!response.ok)
    throw Error(
      response.status === 409
        ? 'Los datos cambiaron. Cierra y vuelve a abrir el formulario para cargar la versión actual.'
        : response.status === 403
          ? 'No tienes permisos para administrar estos tipos de tarea.'
          : response.status === 422
            ? 'Revisa los campos. Los tipos seleccionados deben estar activos en el catálogo.'
            : 'No pudimos guardar los tipos de tarea. Vuelve a intentarlo.',
    )
  return response.json() as Promise<unknown>
}
