import type { Project } from './Project'

export type ProjectPage = { items: Project[]; next_cursor: string | null }
