import Pagination from './Pagination'
import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseGitAliasPage } from '../utils/parseGitAliasPage'
import DataMessage from './DataMessage'
export default function MemberGitAliases({ memberId }: { memberId: string }) {
 const { t } = useTranslation(), [cursors, setCursors] = useState([''])
 const after = cursors.at(-1)!, data = useApiData(`/api/v1/members/${encodeURIComponent(memberId)}/git-aliases?limit=20${after ? `&after=${encodeURIComponent(after)}` : ''}`, parseGitAliasPage)
 const aliases=data.data?.items.filter(alias=>!alias.revoked_at)??[]
 return <details className="mt-6 border-t border-base-300 pt-5" aria-label={t('Alias Git')}><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold"><GitBranch size={15}/>{t('Alias Git')}</summary><div className="mt-4">{data.loading || data.error ? <DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload}/> : aliases.length ? <ul className="space-y-3 text-xs">{aliases.map(alias => <li key={alias.id}><span className="block break-all text-base-content/75">{alias.email}</span><span className="mt-1 block break-all text-base-content/40">{alias.provider === 'github' ? 'GitHub' : 'GitLab'} · {alias.host}</span></li>)}</ul> : <p className="text-xs text-base-content/45">{t('Sin alias Git vinculados.')}</p>}{(cursors.length>1||data.data?.has_more)&&<Pagination page={cursors.length} busy={data.loading} hasNext={!!data.data?.next_after} onPrevious={()=>setCursors(values=>values.slice(0,-1))} onNext={()=>{if(data.data?.next_after)setCursors(values=>[...values,data.data!.next_after!])}}/>}</div></details>
}
