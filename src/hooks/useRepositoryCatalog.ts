import {useEffect,useState} from 'react'
import {readRepositoryCatalog} from '../services/readRepositoryCatalog'
import type {RemoteRepository} from '../types/RemoteRepository'
export function useRepositoryCatalog(connectionId:string|undefined){
 const [attempt,setAttempt]=useState(0)
 const [state,setState]=useState<{key:string;items:RemoteRepository[];error:string|null}>({key:'',items:[],error:null})
 const key=`${connectionId??''}:${attempt}`
 useEffect(()=>{
  if(!connectionId)return
  const controller=new AbortController()
  readRepositoryCatalog(connectionId,controller.signal).then(items=>{if(!controller.signal.aborted)setState({key,items,error:null})}).catch(error=>{if(!controller.signal.aborted)setState({key,items:[],error:error instanceof Error?error.message:'No pudimos consultar los datos. Vuelve a intentarlo.'})})
  return()=>controller.abort()
 },[connectionId,key])
 return {items:state.key===key?state.items:[],error:state.key===key?state.error:null,loading:!!connectionId&&state.key!==key,reload:()=>setAttempt(v=>v+1)}
}
