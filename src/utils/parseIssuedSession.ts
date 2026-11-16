import type { Session } from '../types/Session'
export function parseIssuedSession(value: unknown, now = Date.now()): Session {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('access_token' in value) ||
    typeof value.access_token !== 'string' ||
    !value.access_token ||
    value.access_token.length > 256 ||
    !('actor_id' in value) ||
    typeof value.actor_id !== 'string' ||
    !value.actor_id ||
    !('token_type' in value) ||
    value.token_type !== 'Bearer' ||
    !('expires_in' in value) ||
    typeof value.expires_in !== 'number' ||
    !Number.isSafeInteger(value.expires_in) ||
    value.expires_in <= 0 ||
    value.expires_in > 2592000
  )
    throw new Error('invalid-session')
  return {
    nextStep: 'next_step' in value && typeof value.next_step === 'string' ? value.next_step : undefined,
    accessToken: value.access_token,
    actorId: value.actor_id,
    expiresAt: now + value.expires_in * 1000,
  }
}
