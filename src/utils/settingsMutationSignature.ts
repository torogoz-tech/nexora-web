/** Keep plaintext credentials out of the retry receipt held by React. */
export async function settingsMutationSignature(input: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(input))
  try {
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('')
  } finally {
    bytes.fill(0)
  }
}
