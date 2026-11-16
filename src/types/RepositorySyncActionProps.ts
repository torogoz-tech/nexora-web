export type RepositorySyncActionProps = {
  projects: { id: string; name: string; repository_id: string }[]
  state: string | null
  onComplete: () => void
}
