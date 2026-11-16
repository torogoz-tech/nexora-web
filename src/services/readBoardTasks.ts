import {readApiJson} from './readApiJson'
import {parseVisibleTaskPage} from '../utils/parseVisibleTaskPage'
import type {VisibleTaskPage} from '../types/VisibleTaskPage'
export async function readBoardTasks(path:string,signal:AbortSignal):Promise<VisibleTaskPage>{
 const initial=new URL(path,window.location.origin)
 initial.searchParams.delete('after')
 const seen=new Set<string>(),items=new Map<string,VisibleTaskPage['items'][number]>()
 let next:string|null=null,latest:VisibleTaskPage
 do{
  const url=new URL(initial)
  if(next)url.searchParams.set('after',next)
  latest=parseVisibleTaskPage(await readApiJson(url.pathname+url.search,signal))
  for(const task of latest.items)items.set(task.id,task)
  next=latest.next_after
  if(next&&seen.has(next))throw Error('El tablero no es válido.')
  if(next)seen.add(next)
 }while(next&&!signal.aborted)
 signal.throwIfAborted()
 return {...latest,items:[...items.values()],next_after:null}
}
