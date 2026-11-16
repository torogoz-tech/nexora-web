import { navigation } from '../app/navigation'
import type { MemberRole } from '../types/MemberRole'
export function workspaceNavigationForRole(role: MemberRole | null) {
  return navigation.map(item => item.id === 'work' && (role === 'technical_lead' || role === 'pmo' || role === 'manager')
    ? { ...item, label: 'Equipo', description: 'Trabajo, jornada y seguimiento del equipo.' }
    : item)
}
