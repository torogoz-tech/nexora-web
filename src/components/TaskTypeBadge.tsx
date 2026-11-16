import {createElement} from 'react'
import {useApiData} from '../hooks/useApiData'
import {parseTaskPoolOptions} from '../utils/parseTaskPoolOptions'
import {getTaskTypeIcon} from '../utils/getTaskTypeIcon'
import {useTranslation} from '../hooks/useTranslation'
export default function TaskTypeBadge({code,name,projectId}: {code:string;name?:string|null;projectId:string|null}) {
 const {t}=useTranslation(),data=useApiData(`/api/v1/tasks/options${projectId?`?project_id=${encodeURIComponent(projectId)}`:''}`,parseTaskPoolOptions)
 const option=data.data?.types.find(type=>type.code===code),Icon=getTaskTypeIcon(code,option?.icon??undefined)
 const defaults:Record<string,string>={task:'Tarea',bug:'Error',improvement:'Mejora',incident:'Incidente',maintenance:'Mantenimiento',research:'Investigación'}
 return <span className="inline-flex items-center gap-2 rounded-lg bg-base-200 px-2.5 py-1.5 text-xs font-medium">{createElement(Icon,{size:15,style:{color:option?.color??undefined}})}{name||option?.name||t(defaults[code]??code)||t('Tipo de tarea')}</span>
}
