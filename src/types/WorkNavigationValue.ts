import type { WorkCatalogState } from './WorkCatalogState'
import type { VisibleTaskType } from './VisibleTaskType'
import type { WorkflowSummary } from './WorkflowSummary'
export type WorkNavigationValue = {
  types: WorkCatalogState<VisibleTaskType>
  workflows: WorkCatalogState<WorkflowSummary>
}
