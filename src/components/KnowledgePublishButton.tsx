import KnowledgeReviewControls from './KnowledgeReviewControls'
import type { KnowledgeDocument } from '../types/KnowledgeDocument'
import type { KnowledgeVersion } from '../types/KnowledgeVersion'
export default function KnowledgePublishButton({document,version,onPublished}:{document:KnowledgeDocument;version:KnowledgeVersion;base:string;onPublished:()=>void}){
 if(!document.revision||document.archived||document.latest_version_id!==version.id)return null
 if(document.published_version_id===version.id)return <span className="badge badge-sm badge-success">Aprobada</span>
 return <KnowledgeReviewControls kind="project_document" id={document.id} revision={document.revision} project={document.project_id} onChanged={onPublished}/>
}
