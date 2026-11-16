import type { EffectivePermissions } from '../types/EffectivePermissions'
export function canReadAnalysisProfiles(permissions: EffectivePermissions | null) {
 return permissions?.grants.some(grant => ['installation:manage','analysis-profiles:read'].includes(grant.capability) && grant.project_id === null) ?? false
}
