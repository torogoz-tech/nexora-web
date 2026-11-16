import {requireRecord} from './requireRecord'
export function parsePrimaryKnowledgeOptions(value:unknown){
 const data=requireRecord(value)
 if(!Array.isArray(data.items))throw Error('No pudimos consultar el conocimiento del proyecto.')
 return {items:data.items.map(value=>{const item=requireRecord(value);if(typeof item.id!=='string'||(typeof item.name!=='string'&&typeof item.title!=='string'))throw Error('Conocimiento inválido.');return {id:item.id,name:typeof item.name==='string'?item.name:String(item.title),archived:item.archived===true}}),next_after:typeof data.next_after==='string'?data.next_after:null}
}
