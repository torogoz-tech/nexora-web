import { requireRecord } from './requireRecord'
import type { NavigationOrder } from '../types/NavigationOrder'
export function parseNavigationOrder(value: unknown): NavigationOrder {
 const v=requireRecord(value)
 if(!Array.isArray(v.paths)||v.paths.length>64||v.paths.some(path=>typeof path!=='string'||!path.startsWith('/settings'))||new Set(v.paths).size!==v.paths.length||!Number.isSafeInteger(v.revision)||Number(v.revision)<0||typeof v.can_manage!=='boolean') throw Error('El orden del menú no es válido.')
 return {paths:v.paths as string[],revision:Number(v.revision),can_manage:v.can_manage}
}
