import {useState} from 'react'
import {useApiData} from '../hooks/useApiData'
import {parseOrganizationStickers} from '../utils/parseOrganizationStickers'
import {useTranslation} from '../hooks/useTranslation'
import {taskStickers} from '../app/taskStickers'
import TaskEvidenceImage from './TaskEvidenceImage'
import DataMessage from './DataMessage'
export default function OrganizationStickerPicker({onSelect}:{onSelect:(text:string)=>void}){
 const {t}=useTranslation(),data=useApiData('/api/v1/stickers',parseOrganizationStickers),[search,setSearch]=useState('')
 return <div className="w-full space-y-3"><input autoFocus className="input w-full" aria-label={t('Buscar stickers')} placeholder={t('Buscar stickers')} value={search} onChange={event=>setSearch(event.target.value)}/><DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/><div className="grid max-h-80 grid-cols-3 gap-3 overflow-y-auto">{taskStickers.filter(item=>t(item.label).toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(item=><button key={item.id} type="button" className="rounded-xl bg-base-200 p-3 text-4xl" aria-label={t(item.label)} onClick={()=>onSelect(`[sticker:${item.id}]`)}>{item.emoji}</button>)}{data.data?.filter(item=>item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(item=><button key={item.id} type="button" className="flex h-28 items-center justify-center overflow-hidden rounded-xl p-2 hover:bg-base-200" aria-label={item.name} onClick={()=>onSelect(`![${item.name.replace(/[[\]\r\n]/g,'')}](${item.url})`)}><TaskEvidenceImage src={item.url} alt={item.name}/></button>)}</div></div>
}
