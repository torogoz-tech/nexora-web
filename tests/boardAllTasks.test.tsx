// @vitest-environment jsdom
import {it,expect,vi} from 'vitest'
import {readBoardTasks} from '../src/services/readBoardTasks'
const read=vi.hoisted(()=>vi.fn())
vi.mock('../src/services/readApiJson',()=>({readApiJson:read}))
vi.mock('../src/utils/parseVisibleTaskPage',()=>({parseVisibleTaskPage:(value:unknown)=>value}))
it('retains tasks from every page so workflow columns never hide earlier cards',async()=>{
 read.mockImplementation(async(path:string)=>({items:[{id:path.includes('after=')?'second':'first'}],total:2,next_after:path.includes('after=')?null:'first'}))
 const result=await readBoardTasks('/api/v1/me/tasks?workflow_id=flow',new AbortController().signal)
 expect(result.items.map(item=>item.id)).toEqual(['first','second'])
 expect(result.next_after).toBeNull()
 expect(read).toHaveBeenCalledTimes(2)
})
