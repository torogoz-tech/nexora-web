import type { NavigationOrder } from './NavigationOrder'
export type NavigationOrderContextValue = { data: NavigationOrder | null; error: string | null; loading: boolean; onSaved: (order: NavigationOrder) => void }
