import { useNavigate, useSearchParams } from 'react-router'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseFeatureCatalog } from '../utils/parseFeatureCatalog'
import { parseFeatureProposal } from '../utils/parseFeatureProposal'
import FeatureProposalDetails from '../components/FeatureProposalDetails'
import DataMessage from '../components/DataMessage'
export default function FeatureProposalPage({id}:{id:string}) {
  const [params]=useSearchParams()
  const project=params.get('project')??''
  const navigate=useNavigate()
  const {t}=useTranslation()
  const base=project?`/api/v1/projects/${encodeURIComponent(project)}`:null
  const catalog=useApiData(base?`${base}/features`:null,parseFeatureCatalog)
  const proposal=useApiData(base?`${base}/feature-proposals/${encodeURIComponent(id)}`:null,parseFeatureProposal)
  return <section className="min-w-0 flex-1">
    {!project?<DataMessage message={t('Selecciona un proyecto para consultar sus funcionalidades.')}/>:catalog.loading||proposal.loading||catalog.error||proposal.error?<DataMessage loading={catalog.loading||proposal.loading} error={catalog.error??proposal.error} onRetry={()=>{catalog.reload();proposal.reload()}}/>:catalog.data&&proposal.data&&<FeatureProposalDetails key={`${project}:${id}`} projectId={project} proposal={proposal.data} features={catalog.data.items} canDecide={catalog.data.can_decide} onClose={()=>navigate(`/knowledge/features?${new URLSearchParams({project})}`)} onSaved={()=>{catalog.reload();proposal.reload()}}/>}
  </section>
}
