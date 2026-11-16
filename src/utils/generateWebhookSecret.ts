/** A 256-bit secret, generated locally without persistence or network requests. */
export function generateWebhookSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const secret = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
  bytes.fill(0)
  return secret
}
