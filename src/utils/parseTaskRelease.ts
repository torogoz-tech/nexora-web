import type {TaskRelease} from '../types/TaskRelease'
import {parseTaskReleases} from './parseTaskReleases'
export function parseTaskRelease(value:unknown):TaskRelease{
 const item=parseTaskReleases({items:[value]}).items[0]!
 if(!Array.isArray(item.tasks)||item.tasks.some(task=>typeof task.task_id!=='string'||!Number.isSafeInteger(task.task_revision)||task.task_revision<1)||!Array.isArray(item.repositories)||item.repositories.some(repo=>typeof repo.repository_id!=='string'||(repo.head_sha!==null&&(typeof repo.head_sha!=='string'||!/^([a-f0-9]{40}|[a-f0-9]{64})$/i.test(repo.head_sha)))))throw Error('La publicación recibida no es válida.')
 return item
}
