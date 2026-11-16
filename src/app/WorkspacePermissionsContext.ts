import { createContext } from 'react'
import type { EffectivePermissions } from '../types/EffectivePermissions'
export const WorkspacePermissionsContext = createContext<EffectivePermissions | null>(null)
