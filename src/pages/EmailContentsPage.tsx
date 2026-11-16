import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import Tooltip from '../components/Tooltip'
import { useState } from 'react'
import { Link } from 'react-router'
import { Paintbrush, Pencil, Search } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseEmailContents } from '../utils/parseEmailContents'
import { emailContentLabels } from '../app/emailContentLabels'
import DataMessage from '../components/DataMessage'

export default function EmailContentsPage() {
 const order=useAlphabeticOrder()
  const { t, language } = useTranslation()
  const resource = useApiData('/api/v1/settings/email-contents',parseEmailContents)
  const [search,setSearch] = useState('')
  const rows = resource.data?.filter(row => row.language === language && t(emailContentLabels[row.kind]).toLocaleLowerCase().includes(search.toLocaleLowerCase())).sort((a,b) => order.compare(t(emailContentLabels[a.kind]),t(emailContentLabels[b.kind]))) ?? []
  return <section className="flex min-w-0 flex-1 flex-col">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-xl font-semibold">Email Template</h1><p className="mt-2 text-sm text-base-content/55">{t('Mensajes de tu organización.')}</p></div>
      <Tooltip label={t('Editar diseño común')}><Link className="btn btn-square btn-sm btn-ghost" aria-label={t('Editar diseño común')} to="/settings/email-template/layout"><Paintbrush size={18}/></Link></Tooltip>
    </header>
    <p className="mb-5 text-sm leading-relaxed text-base-content/60">{t('La organización define el diseño y la redacción. Nexora decide cuándo enviar, a quién y qué valores insertar en los parámetros.')}</p>
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/><label className="input input-sm flex min-w-48 flex-1 items-center gap-2"><Search size={15}/><input aria-label={t('Buscar correos')} placeholder={t('Buscar correos')} value={search} onChange={e=>setSearch(e.target.value)}/></label>
    </div>
    {resource.loading || resource.error ? <DataMessage loading={resource.loading} error={resource.error} onRetry={resource.reload}/> : <div className="overflow-x-auto">
      <table className="table w-full"><thead><tr><th>{t('Correo')}</th><th><span className="sr-only">{t('Acciones')}</span></th></tr></thead><tbody>
        {rows.map(row=><tr key={`${row.kind}-${row.language}`}>
          <td><p className="font-medium">{t(emailContentLabels[row.kind])}</p></td>
          <td><Tooltip label={t('Editar correo')}><Link className="btn btn-ghost btn-square btn-sm" aria-label={`${t('Editar correo')}: ${t(emailContentLabels[row.kind])}`} to={`/settings/email-template/${row.kind}/${row.language}`}><Pencil size={16}/></Link></Tooltip></td>
        </tr>)}
      </tbody></table>
      {rows.length===0 && <p className="py-10 text-center text-sm text-base-content/50">{t('No hay correos que coincidan con la búsqueda.')}</p>}
    </div>}
  </section>
}
