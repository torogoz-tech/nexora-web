import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {expect,it} from 'vitest'
import ProfileActivityFeed from '../src/components/ProfileActivityFeed'

it('identifies each commit repository without replacing its project or branches',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><ProfileActivityFeed projectName={()=>'Smart Ticket'} events={[
 {id:'one',project_id:'project',kind:'commit',title:'Fix payments',created_at:'2026-11-09T12:00:00Z',repository_name:'Infinitech/API',repository_id:'api',commit_sha:'a'.repeat(40),branches:['develop']},
 {id:'two',project_id:'project',kind:'commit',title:'Fix checkout',created_at:'2026-11-09T13:00:00Z',repository_name:'Infinitech/Web',repository_id:'web',commit_sha:'b'.repeat(40),branches:['main']},
 ]}/></MemoryRouter>)
 expect(html).toContain('Infinitech/API')
 expect(html).toContain('Infinitech/Web')
 expect(html).toContain('Smart Ticket')
 expect(html).toContain('develop')
})
