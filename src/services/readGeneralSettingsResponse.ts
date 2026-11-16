export async function readGeneralSettingsResponse(
  response: Response,
  path: string,
): Promise<unknown> {
  if (response.status === 403)
    throw Error('No tienes permisos para administrar la configuración global.')
  if (response.status === 409)
    throw Error(
      'La configuración cambió en otra sesión. Revisa los datos actualizados y vuelve a intentarlo.',
    )
  if (
    path.endsWith('/logo') &&
    (response.status === 422 || response.status === 413)
  ) {
    const problem = (await response.json().catch(() => null)) as {
      title?: unknown
    } | null
    const title = typeof problem?.title === 'string' ? problem.title : ''
    if (response.status === 413 || title.includes('logo exceeds 2 MB'))
      throw Error('La imagen supera el límite de 2 MB.')
    if (title.includes('square and at least 128'))
      throw Error(
        'No pudimos preparar la imagen al tamaño requerido. Vuelve a seleccionarla.',
      )
    if (title.includes('dimension') || title.includes('between 1 and 4096'))
      throw Error('La imagen debe tener entre 1 y 4096 píxeles por lado.')
    if (title.includes('PNG, JPEG or WebP'))
      throw Error('El archivo debe ser una imagen PNG, JPEG o WebP.')
    if (
      title.includes('invalid logo encoding') ||
      title.includes('invalid logo image')
    )
      throw Error(
        'No pudimos leer la imagen. Comprueba que el archivo no esté dañado.',
      )
    throw Error(
      'La API rechazó el logo. Vuelve a seleccionarlo o inténtalo con otra imagen.',
    )
  }
  if (response.status === 422 && path.endsWith('/organization'))
    throw Error('Revisa los datos de la organización.')
  if (response.status === 422 && path.endsWith('/timezone'))
    throw Error('Selecciona una zona horaria válida para la organización.')
  if (response.status === 422 && path.endsWith('/email-access'))
    throw Error('Introduce una URL HTTPS sin rutas, parámetros ni credenciales. En desarrollo puedes usar http://localhost:5173.')
  if (response.status === 422 && path.includes('/email-contents/'))
    throw Error('Revisa el asunto, el contenido y los parámetros obligatorios.')
  if (response.status === 422 && path.endsWith('/email-template'))
    throw Error('Revisa la plantilla HTML y las variables disponibles.')
  if (response.status === 422)
    throw Error(
      'Revisa los campos. Si cambias el destino de un servicio, introduce una credencial nueva.',
    )
  if (!response.ok)
    throw Error('No pudimos guardar los cambios. Vuelve a intentarlo.')
  return response.json()
}
