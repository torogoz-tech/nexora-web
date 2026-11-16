export type ApiDataState<T> = {
  key: string
  data: T | null
  error: string | null
}
