import type { TaskTypeIcon } from './TaskTypeIcon'
export type ProfilePriorityTask = { id: string; project_id: string; title: string; priority: 'high' | 'critical'; type_code?: string; type_name?: string; type_icon?: TaskTypeIcon; type_color?: string | null }
