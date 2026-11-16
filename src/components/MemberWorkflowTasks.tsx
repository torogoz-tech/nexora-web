import {Link} from 'react-router'
import {Workflow} from 'lucide-react'
import {useTranslation} from '../hooks/useTranslation'
import type {ProfileWorkflowTask} from '../types/ProfileWorkflowTask'
export default function MemberWorkflowTasks({tasks}:{tasks:ProfileWorkflowTask[]}) {
 const {t}=useTranslation()
 return <section aria-label={t('Tareas en ejecución')}><header className="mb-3 flex items-center gap-2"><Workflow size={17}/><h2 className="font-semibold">{t('Tareas en ejecución')}</h2><span className="ml-auto text-xs text-base-content/45">{tasks.length}</span></header>{tasks.length?<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{tasks.map(task=><li key={task.id} className="min-w-0 rounded-xl border border-base-300 p-4"><Link to={`/tasks/${encodeURIComponent(task.id)}`} className="block break-words text-sm font-medium hover:underline">{task.title}</Link><p className="mt-3 flex items-center gap-2 text-xs"><span className="size-2 rounded-full" style={{backgroundColor:task.color??'currentColor'}}/>{task.state}</p><p className="mt-1 text-xs text-base-content/50">{task.workflow}</p></li>)}</ul>:<p className="text-sm text-base-content/45">{t('No hay tareas en ejecución.')}</p>}</section>
}
