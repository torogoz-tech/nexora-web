import {requireRecord} from './requireRecord'
export function parseRepositoryFile(value:unknown){
 const file=requireRecord(value)
 if(typeof file.path!=='string'||typeof file.commit!=='string'||(file.content!==null&&typeof file.content!=='string')||(file.warning!==null&&typeof file.warning!=='string'))throw Error('La información del repositorio no es válida.')
 return {path:file.path,commit:file.commit,content:file.content as string|null,warning:file.warning as string|null}
}
