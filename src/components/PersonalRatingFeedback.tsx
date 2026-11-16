import {Sparkles} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {useTranslation} from '../hooks/useTranslation'
import {parseRatingFeedback} from '../utils/parseRatingFeedback'
import {apiFetch} from '../services/apiFetch'
import IconButton from './IconButton'
import DataMessage from './DataMessage'
export default function PersonalRatingFeedback({year}:{year:number}){
 const {t}=useTranslation(),mutation=useIntegrationMutation(),path=`/api/v1/me/rating-feedback?year=${year}`
 const data=useApiData(path,parseRatingFeedback)
 return <section className="min-w-0"><header className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{t('Feedback')}</h2><div className="flex gap-2"><IconButton label={t('Generar feedback con IA')} disabled={mutation.busy||data.loading} aria-busy={mutation.busy} onClick={()=>void mutation.run({year},async(signal)=>{const response=await apiFetch(path,{method:'POST',signal});if(!response.ok)throw Error(response.status===409?'El feedback se está generando o se actualizó recientemente. Inténtalo más tarde.':'No pudimos generar el feedback. Revisa la configuración de IA o inténtalo más tarde.');parseRatingFeedback(await response.json());data.reload()})}><Sparkles size={16}/></IconButton></div></header><p className="mb-4 text-xs text-base-content/50">{t('Feedback privado, visible únicamente para ti. Solo se genera cuando lo solicitas.')}</p>{data.error||data.loading?<DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload}/>:data.data?.report?<><p className="text-sm leading-relaxed">{data.data.report.summary}</p>{(['strengths','improvements','actions'] as const).map((key,index)=>data.data!.report![key].length>0&&<div key={key} className="mt-4"><h3 className="mb-2 text-sm font-medium">{t(['Fortalezas','Oportunidades de mejora','Próximos pasos'][index])}</h3><ul className="list-disc space-y-2 pl-5 text-sm text-base-content/65">{data.data!.report![key].map((text,i)=><li key={i}>{text}</li>)}</ul></div>)}</>:<p className="text-sm text-base-content/50">{t('Todavía no has generado tu feedback personal.')}</p>}{mutation.error&&<p role="alert" className="mt-3 text-xs text-error">{t(mutation.error)}</p>}</section>
}
