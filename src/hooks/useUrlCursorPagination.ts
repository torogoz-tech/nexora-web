import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
export function useUrlCursorPagination(){
 const [params,setParams]=useSearchParams(),{pathname}=useLocation()
 const after=params.get('after')
 const filters=new URLSearchParams(params);filters.delete('after')
 const scope=`${pathname}?${filters}`
 const [trail,setTrail]=useState({scope,cursors:[after] as (string|null)[]})
 const cursors=trail.scope===scope?trail.cursors:[after]
 const index=cursors.indexOf(after)
 function move(value:string|null,nextTrail:(string|null)[]){
  setTrail({scope,cursors:nextTrail})
  const next=new URLSearchParams(params)
  if(value)next.set('after',value);else next.delete('after')
  setParams(next)
 }
 return {after,page:cursors[0]===null&&index>=0?index+1:undefined,hasPrevious:after!==null,
  previous:()=>{const values=index>0?cursors.slice(0,index):[null];move(values.at(-1)!,values)},
  next:(value:string)=>move(value,[...(index>=0?cursors.slice(0,index+1):[after]),value])}
}
