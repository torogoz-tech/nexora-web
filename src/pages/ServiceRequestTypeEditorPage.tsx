import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseServiceRequestTypes } from '../utils/parseServiceRequestTypes'
import DataMessage from '../components/DataMessage'
import RowAction from '../components/RowAction'
import ServiceRequestTypeForm from '../components/ServiceRequestTypeForm'
export default function ServiceRequestTypeEditorPage({ id }: { id?: string }) {
  const { t } = useTranslation(), navigate = useNavigate()
  const remote = useApiData('/api/v1/requests/types', parseServiceRequestTypes)
  const item = remote.data?.items.find(item => item.id === id)
  return <section className="min-w-0 flex-1 pb-12">
    <header className="mb-7 flex items-center gap-3"><RowAction label={t('Volver a tipos de solicitudes')} to="/settings/request-types"><ArrowLeft size={16}/></RowAction><h1 className="text-xl font-semibold">{t(id ? 'Editar tipo de solicitud' : 'Crear tipo de solicitud')}</h1></header>
    {remote.loading || remote.error ? <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload}/> : !remote.data?.can_manage ? <DataMessage message={t('No tienes permisos para realizar esta acción.')}/> : id && !item ? <DataMessage message={t('El tipo recibido no es válido.')}/> : <ServiceRequestTypeForm key={id ?? 'new'} item={item} onSaved={() => navigate('/settings/request-types')}/>}
  </section>
}
