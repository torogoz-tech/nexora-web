// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {afterEach,describe,expect,it,vi} from 'vitest'
import {apiFetch} from '../services/apiFetch'
import TaskTransitionBranchLookup from '../components/TaskTransitionBranchLookup'
vi.mock('../services/apiFetch',()=>({apiFetch:vi.fn()}))
afterEach(()=>{cleanup();vi.resetAllMocks()})
describe('provider branch lookup',()=>{
 it('uses a verified branch head without making a Git mutation',async()=>{
  const onChange=vi.fn(),branch={repository_id:'repo',branch_name:'feature/work',expected_head_sha:''},sha='a'.repeat(40)
  vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify({...branch,expected_head_sha:sha,provenance:'provider_verified'})))
  render(<TaskTransitionBranchLookup taskId="task" branch={branch} onChange={onChange}/>)
  fireEvent.click(screen.getByRole('button',{name:'Consultar commit en Git'}))
  await waitFor(()=>expect(onChange).toHaveBeenCalledWith(sha))
  expect(apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task/transition-repositories/repo/branches/feature/work',expect.objectContaining({signal:expect.any(AbortSignal)}))
 })
 it('never attaches a stale response after the user changes the branch',async()=>{
  let resolve!:(value:Response)=>void
  vi.mocked(apiFetch).mockReturnValue(new Promise(done=>{resolve=done}))
  const onChange=vi.fn(),branch={repository_id:'repo',branch_name:'develop',expected_head_sha:''}
  const {rerender}=render(<TaskTransitionBranchLookup taskId="task" branch={branch} onChange={onChange}/>)
  fireEvent.click(screen.getByRole('button',{name:'Consultar commit en Git'}))
  rerender(<TaskTransitionBranchLookup taskId="task" branch={{...branch,branch_name:'stage'}} onChange={onChange}/>)
  resolve(new Response(JSON.stringify({...branch,expected_head_sha:'a'.repeat(40)})))
  await waitFor(()=>expect(screen.getByRole('button').hasAttribute('disabled')).toBe(false))
  expect(onChange).not.toHaveBeenCalled()
 })
 it('rejects mismatched repository identity rather than accepting its SHA',async()=>{
  vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify({repository_id:'other',branch_name:'develop',expected_head_sha:'a'.repeat(40)})))
  const onChange=vi.fn()
  render(<TaskTransitionBranchLookup taskId="task" branch={{repository_id:'repo',branch_name:'develop',expected_head_sha:''}} onChange={onChange}/>)
  fireEvent.click(screen.getByRole('button',{name:'Consultar commit en Git'}))
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(onChange).not.toHaveBeenCalled()
 })
})
