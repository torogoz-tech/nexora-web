export type Session = {
  accessToken?: string
  sessionId?: string
  actorId: string
  expiresAt: number
  nextStep?: string
  displayName?: string
}
