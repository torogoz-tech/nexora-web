import type { EffectivePermissions } from '../types/EffectivePermissions'
export function canManageAnalysisProfiles(permissions: EffectivePermissions | null) {
 return permissions?.grants.some(grant => grant.capability === 'installation:manage' && grant.project_id === null) ?? false
}
