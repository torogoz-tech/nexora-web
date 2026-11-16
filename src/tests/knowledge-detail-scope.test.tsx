import { expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ClipboardList } from 'lucide-react'
import KnowledgePage from '../pages/KnowledgePage'
vi.mock('../hooks/useProjectScope', () => ({ useProjectScope: () => ({ projectId:'p1', choices:[{id:'p1',name:'CDCA'}], projects:{hasMore:false}, loading:false, error:null }) }))
vi.mock('../hooks/useLiveUpdates', () => ({ useLiveUpdates: () => 'connected' }))
vi.mock('../components/KnowledgeArticle', () => ({ default: ({ projectId }: {projectId:string}) => <article>{projectId}</article> }))
it('retains project scope for the article without exposing a project selector while reading', () => {
 const markup = renderToStaticMarkup(<MemoryRouter initialEntries={['/knowledge/requirements?project=p1&article=d1']}><KnowledgePage section={{path:'/knowledge/requirements',label:'Requerimientos',description:'',icon:ClipboardList}}/></MemoryRouter>)
 expect(markup).toContain('<article>p1</article>')
 expect(markup).not.toContain('Ámbito del conocimiento')
 expect(markup).not.toContain('role="combobox"')
})
