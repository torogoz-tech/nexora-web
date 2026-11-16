import type { MemberRole } from './MemberRole'
export type EffectivePermissions = { actor_id: string; role: MemberRole | null; grants: { capability: string; project_id: string | null }[] }
