import { createContext } from 'react'
import type { NavigationOrderContextValue } from '../types/NavigationOrderContextValue'
export const NavigationOrderContext=createContext<NavigationOrderContextValue>({data:null,error:null,loading:false,onSaved:()=>{}})
