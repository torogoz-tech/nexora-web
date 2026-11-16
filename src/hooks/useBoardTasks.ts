import {useEffect,useState} from 'react'
import {useApiInvalidation} from './useApiInvalidation'
import {readBoardTasks} from '../services/readBoardTasks'
import type {VisibleTaskPage} from '../types/VisibleTaskPage'
export function useBoardTasks(path:string){
 const [attempt,setAttempt]=useState(0)
 const [state,setState]=useState<{path:string;data:VisibleTaskPage|null;error:string|null}>({path:'',data:null,error:null})
 useApiInvalidation(path,()=>setAttempt(value=>value+1))
 useEffect(()=>{
  const controller=new AbortController()
  readBoardTasks(path,controller.signal).then(data=>{if(!controller.signal.aborted)setState({path,data,error:null})}).catch(error=>{if(!controller.signal.aborted)setState({path,data:null,error:error instanceof Error?error.message:'No pudimos consultar los datos. Vuelve a intentarlo.'})})
  return()=>controller.abort()
 },[path,attempt])
 return {data:state.path===path?state.data:null,error:state.path===path?state.error:null,loading:state.path!==path,reload:()=>setAttempt(value=>value+1)}
}
