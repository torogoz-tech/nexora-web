import {requireRecord} from './requireRecord'
export function parseRepositoryCommit(value:unknown){
 const data=requireRecord(value),text=(value:unknown):string=>{if(typeof value!=='string')throw Error('El commit recibido no es válido.');return value}
 if(!Array.isArray(data.files)||typeof data.has_more!=='boolean')throw Error('El commit recibido no es válido.')
 return {sha:text(data.sha),message:text(data.message),author:text(data.author),created_at:text(data.created_at),has_more:data.has_more,files:data.files.map(value=>{const file=requireRecord(value);return {path:text(file.path),status:text(file.status),patch:file.patch==null?null:text(file.patch)}})}
}
