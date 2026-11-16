// @vitest-environment jsdom
import {afterEach,describe,it,expect,vi} from 'vitest'
import {render,fireEvent,cleanup} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import IconButton from '../src/components/IconButton'
import TaskSectionNavigation from '../src/components/TaskSectionNavigation'
import TaskCommentBody from '../src/components/TaskCommentBody'
import {parseTaskComments} from '../src/utils/parseTaskComments'
import {parseTaskDocuments} from '../src/utils/parseTaskDocuments'
import {parseOrganizationDocuments} from '../src/utils/parseOrganizationDocuments'
afterEach(cleanup)
describe('task collaboration and shared knowledge',()=>{
 it('renders known stickers, preserves emoji and treats unknown sticker/HTML as text',()=>{
  const view=render(<TaskCommentBody body={'Hola 👍 [sticker:celebrate] <script>alert(1)</script> [sticker:unknown]'}/> )
  expect(view.getByRole('img',{name:'Celebración'})).toBeTruthy()
  expect(view.container.textContent).toContain('👍');expect(view.container.querySelector('script')).toBeNull();expect(view.container.textContent).toContain('[sticker:unknown]')
 })
 it('uses top-layer tooltips and closes them on scroll and Escape; buttons do not submit forms implicitly',()=>{
  const submit=vi.fn((e:Event)=>e.preventDefault()),view=render(<form onSubmit={submit}><IconButton label="Guardar"><span>+</span></IconButton></form>)
  const button=view.getByRole('button',{name:'Guardar'}),tip=view.container.querySelector('[role=tooltip]') as HTMLElement
  expect(tip.getAttribute('popover')).toBe('manual');expect(tip.hidden).toBe(true)
  fireEvent.focus(button);expect(tip.hidden).toBe(false)
  fireEvent.keyDown(button,{key:'Escape'});expect(tip.hidden).toBe(true)
  fireEvent.mouseEnter(button.parentElement!);expect(tip.hidden).toBe(false)
  fireEvent.scroll(window);expect(tip.hidden).toBe(true)
  fireEvent.click(button);expect(submit).not.toHaveBeenCalled()
 })
 it('offers direct section anchors, including documents and comments',()=>{
  const view=render(<MemoryRouter><TaskSectionNavigation/></MemoryRouter>)
  expect(view.getByRole('link',{name:'Datos de la tarea'}).getAttribute('href')).toBe('#task-metadata')
  expect(view.getByRole('link',{name:'Comentarios'}).getAttribute('href')).toBe('#task-comments')
  expect(view.getByRole('link',{name:'Documentos adjuntos'}).getAttribute('href')).toBe('#task-documents')
 })
 it('validates comments and attachment metadata before rendering',()=>{
  expect(parseTaskComments({items:[{id:'c',actor_id:'a',actor_name:'Archived author',body:'👍',created_at:'2026-11-09',sequence:1}],next_after:null}).items[0].actor_name).toBe('Archived author')
  expect(()=>parseTaskDocuments({items:[{id:'d',task_id:'t',name:'file.pdf',uploaded_by:'a',created_at:'date',size_bytes:-1}],next_after:null})).toThrow()
  expect(parseOrganizationDocuments({items:[{id:'d',kind:'best_practice',title:'Policy',created_by:'a',revision:2}],next_after:null}).items[0].revision).toBe(2)
 })
})
