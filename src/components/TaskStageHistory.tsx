import {useTranslation} from '../hooks/useTranslation'
import {useApiData} from '../hooks/useApiData'
import {parseTaskStageCompletions} from '../utils/parseTaskStageCompletions'
import DataMessage from './DataMessage'
export default function TaskStageHistory({taskId,completed,currentTerminal}:{taskId:string;completed:boolean;currentTerminal:boolean}){
 const {t,dateLocale}=useTranslation()
 const stages=useApiData(`/api/v1/tasks/${encodeURIComponent(taskId)}/stages`,parseTaskStageCompletions)
 return <section className="mt-5 space-y-3 border-t border-base-300 pt-4" aria-label={t('Historial de etapas')}><h3 className="text-sm font-semibold">{t('Historial de etapas')}</h3>{currentTerminal&&!completed&&<p role="status" className="rounded-xl bg-base-200 p-3 text-sm">{t('Etapa completada; pendiente de entrega')}<span className="mt-1 block text-xs text-base-content/60">{t('La tarea se completará globalmente después de verificar su publicación en producción.')}</span></p>}{stages.loading||stages.error?<DataMessage loading={stages.loading} error={stages.error} onRetry={stages.reload}/>:stages.data?.length?<ol className="space-y-2">{stages.data.map((stage,index)=><li key={`${stage.workflow_version_id}:${stage.task_revision}`} className="flex flex-wrap items-center justify-between gap-2 text-xs"><span>{t('Etapa {0}',{'0':String(index+1)})} · {t('Etapa completada')}</span><time dateTime={stage.completed_at} className="text-base-content/50">{new Date(stage.completed_at).toLocaleString(dateLocale)}</time></li>)}</ol>:<p className="text-xs text-base-content/50">{t('Sin etapas completadas.')}</p>}</section>
}
