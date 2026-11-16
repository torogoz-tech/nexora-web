export type NumberPage<T> = {
  items: T[]
  next_page: number | null
  page: number
}
