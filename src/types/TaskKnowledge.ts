export type TaskKnowledge = {
  can_read: boolean
  features?: {id:string;name:string;archived:boolean}[]
  feature: { id: string; name: string; archived: boolean } | null
  documents: { id: string; version_id: string; title: string; kind: string; relation: string }[]
  has_more: boolean
}
