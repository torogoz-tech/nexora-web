export type WorkCatalogState<T> = {
  items: T[]
  total: number | null
  loading: boolean
  error: string | null
  reload: () => void
}
