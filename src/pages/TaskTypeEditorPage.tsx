import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useWorkCatalog } from '../hooks/useWorkCatalog'
import { useTranslation } from '../hooks/useTranslation'
import { parseCatalogTaskTypePage } from '../utils/parseCatalogTaskTypePage'
import DataMessage from '../components/DataMessage'
import RowAction from '../components/RowAction'
import TaskTypeForm from '../components/TaskTypeForm'
import type { TaskTypeEditorPageProps } from '../types/TaskTypeEditorPageProps'
export default function TaskTypeEditorPage({code}:TaskTypeEditorPageProps){
 const {t}=useTranslation(),navigate=useNavigate()
 const catalog=useWorkCatalog(code?'/api/v1/task-types':null,parseCatalogTaskTypePage)
 const type=catalog.items.find(item=>item.code===code)
 return <section className="min-w-0 flex-1"><header className="mb-7 flex items-center gap-3"><RowAction label={t('Volver a tipos de tareas')} to="/settings/task-types"><ArrowLeft size={16}/></RowAction><h1 className="text-xl font-semibold">{t(code?'Editar tipo de tarea':'Crear tipo de tarea')}</h1></header>{code&&(catalog.loading||catalog.error)?<DataMessage loading={catalog.loading} error={t(catalog.error)} onRetry={catalog.reload}/>:code&&!type?<DataMessage message={t('El tipo de tarea no está disponible.')}/>:<TaskTypeForm key={type?.code??'new'} type={type} onSaved={()=>navigate('/settings/task-types')}/>}</section>
}
