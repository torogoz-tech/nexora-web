export function browserHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init)
  if (typeof window !== 'undefined' && window.location?.origin) headers.set('X-Nexora-Browser', window.location.origin)
  return headers
}
