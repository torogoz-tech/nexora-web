import {requireRecord} from './requireRecord'
import {parseOrganizationDocument} from './parseOrganizationDocument'
export function parseOrganizationDocuments(value:unknown){const v=requireRecord(value);if(!Array.isArray(v.items)||(v.next_after!==null&&typeof v.next_after!=='string'))throw Error('El catálogo general no es válido.');return {items:v.items.map(parseOrganizationDocument),next_after:v.next_after as string|null}}
