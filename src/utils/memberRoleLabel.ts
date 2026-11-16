import type { MemberRole } from '../types/MemberRole'
export function memberRoleLabel(role: MemberRole | null | undefined): string {
  switch (role) {
    case 'user': return 'Usuario'
    case 'supervisor': return 'Supervisor'
    case 'developer': return 'Desarrollador'
    case 'technical_lead': return 'Líder Técnico'
    case 'pmo': return 'PMO'
    case 'manager': return 'Gerente'
    case 'super_admin': return 'Superadministrador'
    case null: return 'Sin rol asignado'
    default: return 'Rol no disponible'
  }
}
