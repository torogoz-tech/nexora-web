export type PasskeyStatus = {
  enabled: boolean
  active_method: 'none' | 'totp' | 'passkey'
  credentials: Array<{ id: string; label: string; created_at: string; last_used_at: string | null }>
}
