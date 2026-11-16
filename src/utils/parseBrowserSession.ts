import type { Session } from '../types/Session'
export function parseBrowserSession(value: unknown, now = Date.now()): Session {
  if (!value || typeof value !== 'object' || !('browser_session' in value) || value.browser_session !== true ||
    !('actor_id' in value) || typeof value.actor_id !== 'string' || !value.actor_id ||
    !('session_id' in value) || typeof value.session_id !== 'string' || !value.session_id ||
    !('expires_in' in value) || typeof value.expires_in !== 'number' || !Number.isSafeInteger(value.expires_in) || value.expires_in <= 0 || value.expires_in > 2592000 ||
    'access_token' in value || 'next_step' in value && value.next_step != null && (typeof value.next_step !== 'string' || !['pending_role', 'totp_enroll', 'totp_verify'].includes(value.next_step))) throw Error('invalid-session')
  return { actorId: value.actor_id, sessionId: value.session_id, expiresAt: now + value.expires_in * 1000,
    nextStep: 'next_step' in value && typeof value.next_step === 'string' ? value.next_step : undefined,
    displayName: 'display_name' in value && typeof value.display_name === 'string' ? value.display_name : undefined }
}
