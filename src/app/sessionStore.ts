import type { Session } from '../types/Session'
export const sessionStore: { current: Session | null | undefined } = {
  current: undefined,
}
