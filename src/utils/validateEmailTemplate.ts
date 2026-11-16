export function validateEmailTemplate(html: string): string | null {
  if (new TextEncoder().encode(html).length > 100000) return 'La plantilla no puede superar los 100 KB.'
  if (html.split('{{body}}').length !== 2) return 'Incluye {{body}} exactamente una vez para insertar el contenido del correo.'
  const tokens = html.match(/\{\{[\s\S]*?(?:\}\}|$)/g) ?? []
  if (tokens.some(token => !['{{body}}', '{{subject}}', '{{organization_name}}'].includes(token)))
    return 'Utiliza únicamente las variables disponibles.'
  return null
}
