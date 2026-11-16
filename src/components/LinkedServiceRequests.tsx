import { Link } from 'react-router'
import { useApiData } from '../hooks/useApiData'
import { parseServiceRequest } from '../utils/parseServiceRequest'
import { requireRecord } from '../utils/requireRecord'
import { useTranslation } from '../hooks/useTranslation'
import DataMessage from './DataMessage'
function parse(value:unknown){const v=requireRecord(value);if(!Array.isArray(v.items))throw Error('Respuesta inválida');return v.items.map(parseServiceRequest)}
export default function LinkedServiceRequests({kind,target}:{kind:'task'|'feature';target:string}){const {t}=useTranslation();const data=useApiData(`/api/v1/requests/linked?${new URLSearchParams({kind,target_id:target})}`,parse);return <section className="mt-8 border-t border-base-300 pt-5"><h2 className="mb-3 font-semibold">{t('Solicitudes vinculadas')}</h2><DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/><ul className="space-y-2">{data.data?.map(r=><li key={r.id}><Link to={`/requests/${r.id}`} className="link text-sm">#{r.number} · {r.title}</Link></li>)}</ul>{data.data?.length===0&&<p className="text-sm text-base-content/50">{t('Sin solicitudes vinculadas.')}</p>}</section>}
