import {useState} from 'react'
import emojis from '../app/standardEmojis.json'
import {useTranslation} from '../hooks/useTranslation'
export default function StandardEmojiPicker({onSelect}:{onSelect:(emoji:string)=>void}){
 const {t}=useTranslation(),[search,setSearch]=useState('')
 const filtered=emojis.filter(item=>`${item.emoji} ${item.name}`.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim()))
 return <div className="space-y-3"><input autoFocus className="input w-full" aria-label={t('Buscar emojis')} placeholder={t('Buscar emojis')} value={search} onChange={event=>setSearch(event.target.value)}/><div className="grid max-h-80 grid-cols-7 gap-1 overflow-y-auto p-1" aria-label={t('Emojis')}>{filtered.map(item=><button key={item.emoji} type="button" className="rounded-lg p-2 text-2xl hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary" aria-label={item.name} title={item.name} onClick={()=>onSelect(item.emoji)}>{item.emoji}</button>)}</div></div>
}
