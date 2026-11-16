export function getWorkflowCanvasKey(
  actor: string,
  project: string,
  workflow: string,
) {
  return `nexora:workflow-layout:${encodeURIComponent(actor)}:${encodeURIComponent(project)}:${encodeURIComponent(workflow)}`
}
