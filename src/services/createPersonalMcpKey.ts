import { apiFetch } from './apiFetch'
import type { PersonalMcpKeyCreate } from '../types/PersonalMcpKeyCreate'
export async function createPersonalMcpKey(input: PersonalMcpKeyCreate, signal: AbortSignal, key: string) {
 const response = await apiFetch('/api/v1/me/mcp-keys', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(input), signal })
 if (response.status === 409) throw Error('Esta clave ya fue generada. Su secreto no se puede recuperar: revócala y crea otra si no lo conservaste.')
 if (!response.ok) throw Error(response.status === 403 ? 'No tienes permisos comunes para los proyectos seleccionados. Selecciona otro alcance.' : 'No pudimos generar la clave MCP. Revisa el alcance y la duración.')
 const value: unknown = await response.json()
 if (!value || typeof value !== 'object' || !('key' in value) || typeof value.key !== 'string' || !value.key.startsWith('nxk_') || value.key.length > 256) throw Error('No pudimos confirmar la clave MCP generada.')
 return value.key
}
