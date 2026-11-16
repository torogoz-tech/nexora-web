import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import MarkdownEditor from '../src/components/MarkdownEditor'
import WikiMarkdown from '../src/components/WikiMarkdown'
import TaskCreatorIdentity from '../src/components/TaskCreatorIdentity'
import TaskStateTiming from '../src/components/TaskStateTiming'
import { markdownImage } from '../src/utils/markdownImage'
import { parseTaskDetails } from '../src/utils/parseTaskDetails'
import { taskReturnPath } from '../src/utils/taskReturnPath'
import { taskDetailPath } from '../src/utils/taskDetailPath'

vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:null})}))

describe('task page presentation', () => {
 it('keeps list filters when opening a task and rejects external return destinations', () => {
  expect(taskDetailPath('tsk_1','/tasks?type=bug&q=OTP')).toContain('returnTo=%2Ftasks%3Ftype%3Dbug%26q%3DOTP')
  for(const path of ['https://evil.example','//evil.example','/tasks/../../settings','/tasks\\evil','/settings']) expect(taskReturnPath(path)).toBe('/tasks')
 })
 it('provides Markdown tools without nested forms or dialogs', () => {
  const html = renderToStaticMarkup(<MarkdownEditor value="## OTP" onChange={()=>{}} label="Contexto de la tarea"/>)
  expect(html).toContain('role="tablist"')
  expect(html).toContain('Insertar imagen')
  expect(html).toContain('Negrita')
  expect(html).toContain('Vista previa')
  expect(html).not.toContain('<form')
  expect(html).not.toContain('<dialog')
 })
 it('renders safe image links and task lists while ignoring raw HTML and unsafe sources', () => {
  const html = renderToStaticMarkup(<WikiMarkdown allowImages text={'## OTP\n- [x] Ready\n![Screenshot](https://example.com/image.png)\n![bad](javascript:alert)\n<script>alert(1)</script>'}/>)
  expect(html).toContain('https://example.com/image.png')
  expect(html).toContain('referrerPolicy="no-referrer"')
  expect(html).toContain('type="checkbox"')
  expect(html).not.toContain('<script')
  expect(html).not.toContain('src="javascript:')
  expect(renderToStaticMarkup(<WikiMarkdown text="![Screenshot](https://example.com/image.png)"/>)).not.toContain('<img')
  for(const url of ['javascript:alert(1)','data:image/png;base64,AAA','https://user:secret@example.com/a.png']) expect(()=>markdownImage(url,'Example')).toThrow()
  expect(markdownImage('https://example.com/a b.png','Screen [one]')).toBe('![Screen one](<https://example.com/a%20b.png>)')
 })
 it('shows the creator name and position, never exposing an actor ID as the label', () => {
  const html = renderToStaticMarkup(<MemoryRouter><TaskCreatorIdentity actorId="act_private" creator={{id:'act_private',name:'Ana',position:'UX Designer',avatar_revision:0}}/></MemoryRouter>)
  expect(html).toContain('Ana')
  expect(html).toContain('UX Designer')
  expect(html).toContain('Avatar de Ana')
  expect(html.replace(/<[^>]*>/g,'')).not.toContain('act_private')
  expect(html).toContain('href="/settings/members/act_private"')
  expect(renderToStaticMarkup(<MemoryRouter><TaskCreatorIdentity actorId="act_private"/></MemoryRouter>).replace(/<[^>]*>/g,'')).not.toContain('act_private')
 })
 it('does not invent an elapsed state time when an older API omits it', () => {
  expect(renderToStaticMarkup(<table><tbody><tr><TaskStateTiming/></tr></tbody></table>)).toContain('<td>—</td><td>—</td>')
 })
 it('parses creator metadata while retaining compatibility with older task responses', () => {
  const value = {id:'task',project_id:null,lifecycle:'pending',workflow_id:null,workflow_version_id:null,state_id:null,assignee_id:null,title:'OTP',context:'',created_by:'actor',revision:1}
  expect(parseTaskDetails(value).creator).toBeUndefined()
  expect(parseTaskDetails({...value,creator:{id:'actor',name:'Ana',position:'QA',avatar_revision:2}}).creator?.position).toBe('QA')
  expect(()=>parseTaskDetails({...value,creator:{id:'actor',name:'Ana',position:'QA',avatar_revision:-1}})).toThrow()
 })
})
