import { useEffect, useState } from 'react'
export function useEmailActionToken(prefix:'nxi'|'nxr'){
  const [token]=useState(()=>new URLSearchParams(window.location.hash.slice(1)).get('token')??'')
  useEffect(()=>{if(window.location.hash)window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search)},[])
  return new RegExp(`^${prefix}_[a-f0-9]{64}$`,'i').test(token)?token:''
}
