import {afterEach,expect,it,vi} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import KnowledgeContributions from '../components/KnowledgeContributions'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import {parseKnowledgeSubmission} from '../utils/parseKnowledgeSubmission'
import type {EffectivePermissions} from '../types/EffectivePermissions'
const doc={id:'knc_manual',title:'Manual de servicio',kind:'document',project_id:null,revision:4,source_revision:2,filename:'manual.pdf',status:'ready',created_by:'dev',body:'## Alcance\nDocumentación revisada'}
vi.mock('../hooks/useApiData',()=>({useApiData:(path:string|null)=>({data:!path?null:path.includes('/knc_manual')?doc:{items:[doc],next_after:null},loading:false,error:null,reload:()=>{}})}))
afterEach(()=>vi.restoreAllMocks())
function render(role:string,path='/knowledge?project=organization'){
 const permissions={role,grants:[],actor_id:'dev'} as EffectivePermissions
 return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><WorkspacePermissionsContext value={permissions}><KnowledgeContributions projectId={null} kind="document" search=""/></WorkspacePermissionsContext></MemoryRouter>)
}
it('allows developer upload and replacement, exposing source and synthesis history without curated edit',()=>{
 expect(render('developer')).toContain('Subir documento')
 const detail=render('developer','/knowledge?project=organization&contribution=knc_manual')
 expect(detail).toContain('Subir nueva versión');expect(detail).toContain('Descargar original');expect(detail).toContain('Revisión 4');expect(detail).toContain('Original 2');expect(detail).not.toContain('Editar documento')
 expect(render('technical_lead','/knowledge?contribution=knc_manual')).toContain('Editar documento')
})
it('hides replacement on historical revisions and rejects malformed document payloads',()=>{
 expect(render('developer','/knowledge?contribution=knc_manual&contributionRevision=1')).not.toContain('Subir nueva versión')
 expect(()=>parseKnowledgeSubmission({id:'broken'})).toThrow()
})
