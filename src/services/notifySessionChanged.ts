export function notifySessionChanged() {
  // Only a notification is shared. The credential is an HttpOnly cookie.
  try { localStorage.setItem('nexora:auth-change', crypto.randomUUID()) } catch { /* Focus also refreshes the session. */ }
}
