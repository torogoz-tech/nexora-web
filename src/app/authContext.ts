import { createContext } from 'react'
import type { AuthContextValue } from '../types/AuthContextValue'
export const authContext = createContext<AuthContextValue | null>(null)
