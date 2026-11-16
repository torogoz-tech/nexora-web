import type {RatingEvidenceAttachment} from './RatingEvidenceAttachment'
export type DeveloperRatingEntry = {
  attachments?: RatingEvidenceAttachment[]
  id: string
  source: 'activity' | 'peer' | 'manager' | 'ai'
  score: number
  reason: string
  created_by: string | null
  created_by_name: string | null
  project_id: string | null
  created_at: string
  evidence_url: string | null
}
