import TaskTypeForm from './TaskTypeForm'
import IntegrationDialog from './IntegrationDialog'
import { useTranslation } from '../hooks/useTranslation'
import type { TaskTypeEditorModalProps } from '../types/TaskTypeEditorModalProps'
export default function TaskTypeEditorModal({type,onClose,onSaved}:TaskTypeEditorModalProps){
 const {t}=useTranslation()
 return <IntegrationDialog title={t(type?'Editar tipo de tarea':'Crear tipo de tarea')} onClose={onClose}><TaskTypeForm type={type} onSaved={onSaved}/></IntegrationDialog>
}
