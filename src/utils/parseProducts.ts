import { requireRecord } from './requireRecord'
import type { Product } from '../types/Product'
export function parseProducts(value:unknown):{items:Product[];can_manage:boolean}{
 const root=requireRecord(value)
 if(!Array.isArray(root.items))throw Error('El catálogo de productos no es válido.')
 const items=root.items.map(value=>{const p=requireRecord(value);if(typeof p.id!=='string'||typeof p.name!=='string'||typeof p.description!=='string'||typeof p.archived!=='boolean'||!Number.isSafeInteger(p.revision)||(p.project_ids!==undefined&&(!Array.isArray(p.project_ids)||p.project_ids.some(v=>typeof v!=='string'))))throw Error('El producto no es válido.');return p as Product})
 return {items,can_manage:root.can_manage===true}
}
