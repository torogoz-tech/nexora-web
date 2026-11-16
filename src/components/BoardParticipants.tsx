import Tooltip from './Tooltip'
import TaskCreatorIdentity from './TaskCreatorIdentity'
import {Link} from 'react-router'
import { useTranslation } from '../hooks/useTranslation'
import { useState } from 'react'
import { UsersRound } from 'lucide-react'
import { personInitials } from '../utils/personInitials'
import IconButton from './IconButton'
import IntegrationDialog from './IntegrationDialog'
import type { BoardParticipantsProps } from '../types/BoardParticipantsProps'
export default function BoardParticipants({
  people,
  scope,
}: BoardParticipantsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  if (!people.length) return null
  const describe = (total: number) =>
    `${total} ${total === 1 ? t('tarea') : t('tareas')} ${scope === 'page' ? t('en esta página') : t('visibles')}`
  return (
    <>
      <div
        className="flex shrink-0 items-center gap-1"
        aria-label={
          scope === 'page'
            ? t('Responsables de esta página')
            : t('Responsables del tablero')
        }
      >
        <ul className="hidden -space-x-1.5 sm:flex">
          {people.slice(0, 4).map((person) => (
            <li
              key={person.actor_id}
            >
              <Tooltip label={`${person.name} · ${describe(person.total)}`}><Link to={`/settings/members/${encodeURIComponent(person.actor_id)}`}
                role="img"
                aria-label={`${person.name} · ${describe(person.total)}`}
                className="flex size-8 items-center justify-center rounded-lg border-2 border-base-100 bg-base-200 text-[10px] font-semibold text-base-content/75"
              >
                {personInitials(person.name)}
              </Link></Tooltip>
            </li>
          ))}
        </ul>
        <IconButton
          type="button"
          label={t('Ver {0} {1}', {
            '0': people.length,
            '1': people.length === 1 ? t('responsable') : t('responsables'),
          })}
          className="tooltip-bottom"
          onClick={() => setOpen(true)}
        >
          <UsersRound size={16} aria-hidden="true" />
        </IconButton>
      </div>
      {open && (
        <IntegrationDialog
          title={t('Responsables de tareas')}
          onClose={() => setOpen(false)}
        >
          <p className="mb-4 text-xs leading-relaxed text-base-content/50">
            {scope === 'page'
              ? t('Personas con tareas en esta página.')
              : t(
                  'Personas con tareas dentro de la búsqueda actual del tablero.',
                )}
          </p>
          <ul className="divide-y divide-base-300">
            {people.map((person) => (
              <li
                key={person.actor_id}
                className="flex items-center gap-3 py-3"
              >
                <TaskCreatorIdentity actorId={person.actor_id} name={person.name}/>
                <span className="text-xs tabular-nums text-base-content/45">
                  {describe(person.total)}
                </span>
              </li>
            ))}
          </ul>
        </IntegrationDialog>
      )}
    </>
  )
}
