import type { Session } from './Session'
export type AuthContextValue = {
  session: Session | null
  status: 'checking' | 'authenticated' | 'anonymous' | 'unavailable'
  notice: string | null
  acceptSession: (session: Session) => void
  logout: () => Promise<void>
  retry: () => void
}
