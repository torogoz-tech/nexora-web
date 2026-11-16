import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { paginationPages } from '../utils/paginationPages'
import type { PaginationProps } from '../types/PaginationProps'
import IconButton from './IconButton'
export default function Pagination({page,hasPrevious=(page??1)>1,hasNext,onPrevious,onNext,count,total,totalPages,onPage,busy=false,label,compact=false}:PaginationProps){
 const {t}=useTranslation()
 return <nav aria-label={label??t('Paginación')} className={`${compact?'':'mt-6'} flex flex-wrap items-center justify-between gap-3`}>
  <span className="text-xs text-base-content/45" aria-live="polite">{count!==undefined?(total!==undefined?t('{0} en esta página · {1} en total',{'0':String(count),'1':String(total)}):t('{0} resultados en esta página',{'0':String(count)})):''}</span>
  <div className="flex items-center gap-1 rounded-xl bg-base-200/50 p-1">
   <IconButton label={t(page===undefined?'Volver al inicio':'Página anterior')} disabled={busy||!hasPrevious} onClick={onPrevious}>{page===undefined?<ChevronsLeft size={16}/>:<ChevronLeft size={16}/>}</IconButton>
   {page!==undefined&&totalPages!==undefined&&onPage?paginationPages(page,Math.max(1,totalPages)).map((value,index)=>value==='gap'?<span key={`gap-${index}`} className="px-1 text-base-content/35" aria-hidden="true">…</span>:<button key={value} type="button" aria-label={t('Ir a la página {0}',{'0':String(value)})} aria-current={value===page?'page':undefined} disabled={busy} onClick={()=>onPage(value)} className={`btn btn-sm btn-square border-0 ${value===page?'bg-base-content/10 text-base-content':'btn-ghost text-base-content/55'}`}>{value}</button>):<span className="min-w-20 px-3 text-center text-xs font-medium" aria-live="polite">{page===undefined?t('Página actual'):t('Página {0}',{'0':String(page)})}</span>}
   <IconButton label={t('Página siguiente')} disabled={busy||!hasNext} onClick={onNext}><ChevronRight size={16}/></IconButton>
  </div>
 </nav>
}
