import {requireRecord} from './requireRecord'
import type {OrganizationDocument} from '../types/OrganizationDocument'
export function parseOrganizationDocument(value:unknown):OrganizationDocument{const d=requireRecord(value);if(!['id','kind','title','created_by'].every(k=>typeof d[k]==='string')||!Number.isSafeInteger(d.revision)||(d.body!==undefined&&typeof d.body!=='string'))throw Error('El documento general no es válido.');return d as OrganizationDocument}
