import type { DeveloperRatingEntry } from './DeveloperRatingEntry'
export type DeveloperRatingDay = {
  date: string
  score: number | null
  excluded: boolean
  push: boolean
  authored: boolean
  entries: DeveloperRatingEntry[]
}
