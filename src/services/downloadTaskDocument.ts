import {apiFetch} from './apiFetch'
import type {TaskDocument} from '../types/TaskDocument'
export async function downloadTaskDocument(document:TaskDocument){const response=await apiFetch(`/api/v1/knowledge/files/${encodeURIComponent(document.id)}/content`);if(!response.ok)throw Error('No pudimos descargar el documento.');const blob=await response.blob(),url=URL.createObjectURL(blob),a=window.document.createElement('a');a.href=url;a.download=document.name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
