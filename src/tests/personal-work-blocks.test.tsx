import {describe,it,expect,vi} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {parsePersonalWorkBlocks} from '../utils/parsePersonalWorkBlocks'
import PersonalWorkBlockModal from '../components/PersonalWorkBlockModal'
vi.mock('../hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'me'}})}))
const block={id:'block',actor_id:'me',title:'Capacitación',date:'2026-11-09',start_time:'09:00',end_time:'11:00',minutes:120,revision:1,task_id:null,overtime_request_id:null,note:null}
describe('personal work blocks',()=>{
 it('accepts independent activities and rejects corrupt ledger data',()=>{
  expect(parsePersonalWorkBlocks({items:[block]}).items[0]?.minutes).toBe(120)
  for(const invalid of [{minutes:-1},{revision:0},{start_time:'25:00'},{task_id:42}])expect(()=>parsePersonalWorkBlocks({items:[{...block,...invalid}]})).toThrow()
 })
 it('edits calendar work in a separate modal with an optional task and approved overtime',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><PersonalWorkBlockModal block={block} date={block.date} onClose={()=>{}} onChanged={()=>{}}/></MemoryRouter>)
  expect(html).toContain('<dialog');expect(html).toContain('Editar actividad laboral');expect(html).toContain('Tarea opcional');expect(html).toContain('09:00');expect(html).toContain('11:00');expect(html).toContain('Eliminar')
 })
})
