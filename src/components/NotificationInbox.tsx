import { useState } from 'react'
import { Link } from 'react-router'
import { Archive, ArchiveRestore, CheckCheck, Inbox, Mail, MailOpen, RefreshCw, ArrowUpRight } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { writeGeneralSettings } from '../services/writeGeneralSettings'
import { parseNotificationInbox } from '../utils/parseNotificationInbox'
import type { InboxNotification } from '../types/InboxNotification'
import type { NotificationInboxProps } from '../types/NotificationInboxProps'
import IconButton from './IconButton'
import Pagination from './Pagination'
import DataMessage from './DataMessage'

export default function NotificationInbox({ onChanged }: NotificationInboxProps) {
  const { t, dateLocale } = useTranslation()
  const [folder, setFolder] = useState('inbox')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<InboxNotification | null>(null)
  const remote = useApiData(`/api/v1/notifications?folder=${folder}&limit=20&offset=${(page - 1) * 20}`, parseNotificationInbox)
  const mutation = useIntegrationMutation()
  const folders = [
    { id: 'inbox', label: 'Recibidas', icon: Inbox },
    { id: 'unread', label: 'Sin leer', icon: Mail },
    { id: 'archived', label: 'Archivadas', icon: Archive },
  ]
  async function update(item: InboxNotification, input: { read?: boolean; archived?: boolean }) {
    await mutation.run({ id: item.id, input }, async (signal, key) => {
      await writeGeneralSettings(`/api/v1/notifications/${encodeURIComponent(item.id)}`, 'PATCH', input, signal, key)
      setSelected((current) => current?.id === item.id ? { ...current, read_at: input.read === false ? null : input.read ? new Date().toISOString() : current.read_at, archived_at: input.archived === false ? null : input.archived ? new Date().toISOString() : current.archived_at } : current)
      if ((folder === 'unread' && input.read) || input.archived !== undefined) setPage(1)
      remote.reload()
      onChanged?.()
    })
  }
  async function open(item: InboxNotification) {
    setSelected(item)
    if (!item.read_at) await update(item, { read: true })
  }
  async function readAll() {
    await mutation.run({ action: 'read-all' }, async (signal, key) => {
      await writeGeneralSettings('/api/v1/notifications/read-all', 'POST', {}, signal, key)
      setSelected((current) => current ? { ...current, read_at: current.read_at ?? new Date().toISOString() } : null)
      setPage(1)
      remote.reload()
      onChanged?.()
    })
  }
  return <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-base-300 px-5 py-4">
      <h1 id="notifications-title" className="flex items-center gap-2 text-lg font-semibold"><Inbox size={21} />{t('Notificaciones')}</h1>
      <div className="flex items-center gap-1">
        <IconButton label={t('Marcar todas como leídas')} disabled={mutation.busy || !remote.data?.unread_count} onClick={() => void readAll()}><CheckCheck size={18} /></IconButton>
        <IconButton label={t('Actualizar notificaciones')} onClick={remote.reload}><RefreshCw size={18} /></IconButton>
      </div>
    </header>
    <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
      <nav aria-label={t('Carpetas de notificaciones')} className="flex shrink-0 gap-1 border-b border-base-300 p-2 sm:w-40 sm:flex-col sm:border-r sm:border-b-0">
        {folders.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={folder === id ? 'page' : undefined} className={`btn btn-sm justify-start border-0 ${folder === id ? 'bg-base-content/10' : 'btn-ghost'}`} onClick={() => { setFolder(id); setPage(1); setSelected(null) }}><Icon size={16} />{t(label)}{id === 'unread' && !!remote.data?.unread_count && <span className="badge badge-sm">{remote.data.unread_count}</span>}</button>)}
      </nav>
      <section aria-label={t('Lista de notificaciones')} className={`${selected ? 'hidden md:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col md:max-w-sm md:border-r md:border-base-300`}>
        <div className="shrink-0 px-3 py-2"><Pagination compact page={page} totalPages={Math.ceil((remote.data?.total ?? 0) / 20)} hasNext={page * 20 < (remote.data?.total ?? 0)} onPrevious={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => p + 1)} onPage={setPage} busy={remote.loading || mutation.busy} /></div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!remote.data ? <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload} /> : !remote.data.items.length ? <p className="p-5 text-sm text-base-content/50">{t('No hay notificaciones en esta carpeta.')}</p> : <ul className="divide-y divide-base-300/60">{remote.data.items.map((item) => <li key={item.id}><button type="button" className={`w-full px-4 py-4 text-left transition-colors hover:bg-base-content/5 ${selected?.id === item.id ? 'bg-base-content/10' : ''}`} onClick={() => void open(item)}>
            <span className="flex items-start gap-2"><span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${item.read_at ? 'bg-transparent' : 'bg-primary'}`} /><span className={`min-w-0 text-sm ${item.read_at ? '' : 'font-semibold'}`}>{item.title}</span></span>
            <p className="mt-1 ml-3.5 line-clamp-2 text-xs leading-relaxed text-base-content/55">{item.body}</p>
            <time className="mt-2 ml-3.5 block text-xs text-base-content/40" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString(dateLocale)}</time>
          </button></li>)}</ul>}
        </div>
      </section>
      <section aria-label={t('Contenido de la notificación')} className={`${selected ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-[1.4] flex-col overflow-y-auto p-5 sm:p-6`}>
        {selected ? <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-sm btn-ghost md:hidden" onClick={() => setSelected(null)}>{t('Volver a recibidas')}</button>
            <IconButton label={t(selected.read_at ? 'Marcar como no leída' : 'Marcar como leída')} disabled={mutation.busy} onClick={() => void update(selected, { read: !selected.read_at })}>{selected.read_at ? <Mail size={18} /> : <MailOpen size={18} />}</IconButton>
            <IconButton label={t(selected.archived_at ? 'Mover a recibidas' : 'Archivar notificación')} disabled={mutation.busy} onClick={() => void update(selected, { archived: !selected.archived_at })}>{selected.archived_at ? <ArchiveRestore size={18} /> : <Archive size={18} />}</IconButton>
          </div>
          <h3 className="text-xl font-semibold break-words">{selected.title}</h3>
          <time className="mt-2 text-xs text-base-content/45" dateTime={selected.created_at}>{new Date(selected.created_at).toLocaleString(dateLocale)}</time>
          <p className="mt-6 text-sm leading-7 whitespace-pre-wrap break-words">{selected.body}</p>
          {selected.url && <Link className="btn btn-sm mt-6 self-start" to={selected.url}>{t('Abrir elemento')}<ArrowUpRight size={16} /></Link>}
        </> : <div className="m-auto text-center text-base-content/40"><MailOpen size={36} className="mx-auto mb-3" /><p className="text-sm">{t('Selecciona una notificación para leerla.')}</p></div>}
      </section>
    </div>
    {mutation.error && <p role="alert" className="shrink-0 px-5 py-3 text-sm text-error">{mutation.error}</p>}
  </div>
}
