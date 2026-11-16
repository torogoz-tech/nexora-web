import { sessionStore } from '../app/sessionStore'
export function getSession() { return sessionStore.current ?? null }
