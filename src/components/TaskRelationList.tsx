import { CheckCheck, Circle, LoaderCircle, Unlink } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import RowAction from './RowAction'
import type { TaskRelationListProps } from '../types/TaskRelationListProps'
export default function TaskRelationList({ items, onOpen, onRemove, busy }: TaskRelationListProps) {
  const { t } = useTranslation()
  return <ul className="mt-2 space-y-1">{items.map(item => {
    const Icon = item.lifecycle === 'completed'||item.stage_completed ? CheckCheck : item.lifecycle === 'active' ? LoaderCircle : Circle
    return <li key={item.relation_id ?? item.id} className="flex min-w-0 items-center gap-2 rounded-lg py-1">
      <Icon size={14} aria-hidden="true" className={`shrink-0 ${item.lifecycle === 'completed'||item.stage_completed ? 'text-success' : 'text-base-content/40'}`}/>
      <button type="button" className="min-w-0 flex-1 rounded-lg px-1 py-1 text-left text-sm hover:text-primary focus-visible:outline focus-visible:outline-primary" onClick={() => onOpen(item)}><span className="block break-words font-medium">{item.title}</span><span className="mt-0.5 block text-[11px] text-base-content/45">{t(item.lifecycle === 'completed' ? 'Completada' : item.stage_completed ? 'Etapa completada; pendiente de entrega' : item.lifecycle === 'active' ? 'En ejecución' : 'Pendiente')}</span>{item.work_kind&&<span className="mt-1 block text-[11px] text-base-content/50">{t(item.work_kind==='corrective'?'Corrección':'Descomposición')}{item.tested_commit_sha&&<code className="ml-2" title={item.tested_commit_sha}>{item.tested_commit_sha.slice(0,12)}</code>}</span>}</button>
      {onRemove && <RowAction label={t('Desvincular {0}', { '0': item.title })} disabled={busy} onClick={() => onRemove(item)}><Unlink size={14}/></RowAction>}
    </li>
  })}</ul>
}
