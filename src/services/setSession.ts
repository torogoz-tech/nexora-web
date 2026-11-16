import { clearMemberAvatarCache } from './memberAvatarCache'
import { sessionStore } from '../app/sessionStore'
import type { Session } from '../types/Session'
export function setSession(session: Session | null) { if (sessionStore.current?.sessionId !== session?.sessionId) clearMemberAvatarCache(); sessionStore.current = session }
