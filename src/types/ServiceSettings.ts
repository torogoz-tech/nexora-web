export type ServiceSettings = {
  settings: Record<string, string | number | boolean>
  has_secret: boolean
  managed: boolean
  revision: number
}
