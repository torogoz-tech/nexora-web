function encode(bytes: ArrayBuffer): string {
  let value = ''
  for (const byte of new Uint8Array(bytes)) value += String.fromCharCode(byte)
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
  const decoded = atob(normalized)
  return Uint8Array.from(decoded, character => character.charCodeAt(0)).buffer as ArrayBuffer
}

export function serializePasskeyRegistration(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAttestationResponse
  return { id: credential.id, transports: response.getTransports?.() ?? [], attestationObject: encode(response.attestationObject), clientDataJSON: encode(response.clientDataJSON) }
}

export function serializePasskeyAuthentication(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAssertionResponse
  return { id: credential.id, authenticatorData: encode(response.authenticatorData), clientDataJSON: encode(response.clientDataJSON), signature: encode(response.signature), userHandle: response.userHandle ? encode(response.userHandle) : null }
}
