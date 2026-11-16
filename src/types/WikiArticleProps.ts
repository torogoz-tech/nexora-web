import type { ReactNode } from 'react'
import type { KnowledgeSection } from './KnowledgeSection'
export type WikiArticleProps = {
  title: string
  category: string
  sections: KnowledgeSection[]
  metadata: { label: string; value: ReactNode }[]
  notices?: string[]
  toolbar?: ReactNode
  children?: ReactNode
}
