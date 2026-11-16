export class ApiReadError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiReadError'
    this.status = status
  }
}
