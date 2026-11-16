import TaskCreatorIdentity from './TaskCreatorIdentity'
import {useTranslation} from '../hooks/useTranslation'
import type {TaskDetails} from '../types/TaskDetails'
export default function TaskPeopleMetadata({task}: {task:TaskDetails}) {
 const {t}=useTranslation()
 if(task.assignee_id===task.created_by)return <div><dt className="text-base-content/40">{t('Creador y responsable')}</dt><dd className="mt-1"><TaskCreatorIdentity actorId={task.created_by} creator={task.creator??task.assignee??undefined} name={task.created_by_name??task.assignee_name}/></dd></div>
 return <><div><dt className="text-base-content/40">{t('Responsable')}</dt><dd className="mt-1">{task.assignee_id?<TaskCreatorIdentity actorId={task.assignee_id} creator={task.assignee??undefined} name={task.assignee_name}/>:t('Sin responsable')}</dd></div><div><dt className="text-base-content/40">{t('Creada por')}</dt><dd className="mt-1"><TaskCreatorIdentity actorId={task.created_by} creator={task.creator} name={task.created_by_name}/></dd></div></>
}
