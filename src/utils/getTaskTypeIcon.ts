import { taskTypeIcons } from '../app/taskTypeIcons'
import {
  Bug,
  ListTodo,
  ListTree,
  Layers,
  Wrench,
  Sparkles,
  BookOpen,
  ClipboardList,
} from 'lucide-react'
export function getTaskTypeIcon(code: string, icon?: string) {
  const configured = taskTypeIcons.find((option) => option.value === icon)
  if (configured) return configured.icon
  const icons: Record<string, typeof ListTodo> = {
    bug: Bug,
    task: ListTodo,
    subtask: ListTree,
    epic: Layers,
    chore: Wrench,
    feature: Sparkles,
    story: BookOpen,
  }
  const key = code.toLocaleLowerCase()
  return Object.hasOwn(icons, key) ? icons[key] : ClipboardList
}
