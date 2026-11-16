import type { DeveloperRatingDay } from './DeveloperRatingDay'
import type { DeveloperRatingPeriod } from './DeveloperRatingPeriod'
export type DeveloperRatingsData = {
  actor_id: string
  year: number
  daily: DeveloperRatingDay[]
  weekly: DeveloperRatingPeriod[]
  monthly: DeveloperRatingPeriod[]
  annual: number | null
  can_rate: boolean
}
