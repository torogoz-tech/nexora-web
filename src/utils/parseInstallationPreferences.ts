import type { InstallationPreferences } from '../types/InstallationPreferences'
export function parseInstallationPreferences(
  value: unknown,
): InstallationPreferences {
  if (
    !value ||
    typeof value !== 'object' ||
    !('language' in value) ||
    !('revision' in value) ||
    !['es', 'en'].includes(String(value.language)) ||
    !Number.isSafeInteger(value.revision) ||
    Number(value.revision) < 1
  )
    throw Error('La configuración de idioma no es válida.')
  return {
    language: value.language as InstallationPreferences['language'],
    revision: Number(value.revision),
  }
}
