import type { ProfileProject } from './ProfileProject'
export type DeveloperRatingMember = { can_view_evaluations?:boolean; can_rate?:boolean; id: string; name: string; projects: ProfileProject[] }
