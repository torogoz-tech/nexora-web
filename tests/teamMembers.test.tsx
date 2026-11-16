import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {expect,it,vi} from 'vitest'
import TeamMembersPage from '../src/pages/TeamMembersPage'
import {parseTeamMembers} from '../src/utils/parseTeamMembers'
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({loading:false,error:null,reload:vi.fn(),data:[{id:'b',name:'Zoe',position:'QA',role:'developer',avatar_revision:0},{id:'a',name:'Ana',position:'UX',role:'developer',avatar_revision:0}]})}))
vi.mock('../src/components/UserAvatar',()=>({default:()=>createElement('span',null,'Avatar')}))
it('offers a read-only alphabetical directory with profile links',()=>{
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(TeamMembersPage)))
 expect(html.indexOf('Ana')).toBeLessThan(html.indexOf('Zoe'))
 expect(html).toContain('href="/settings/members/a"')
 expect(html).toContain('UX')
 expect(html).not.toContain('Editar posición')
 expect(html).not.toContain('Configurar rol')
 expect(html).not.toContain('Archivar')
})
it('discards administrative and private fields from directory responses',()=>{
 const members=parseTeamMembers([{id:'a',name:'Ana',position:'UX',role:'developer',avatar_revision:0,email:'private@example.com',feedback:'private'}])
 expect(members[0]).not.toHaveProperty('email')
 expect(members[0]).not.toHaveProperty('feedback')
})
