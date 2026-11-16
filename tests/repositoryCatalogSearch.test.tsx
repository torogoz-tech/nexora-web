// @vitest-environment jsdom
import {it,expect,vi} from 'vitest'
import {readRepositoryCatalog} from '../src/services/readRepositoryCatalog'
const read=vi.hoisted(()=>vi.fn())
vi.mock('../src/services/readApiJson',()=>({readApiJson:read}))
it('loads all provider pages before searching and paginating repository results',async()=>{
 read.mockImplementation(async(path:string)=>({items:[{provider:'github',remote_id:path.includes('page=1&')?'1':'2',full_name:path.includes('page=1&')?'org/Other':'org/H2H'}],next_page:path.includes('page=1&')?2:null}))
 const result=await readRepositoryCatalog('connection',new AbortController().signal)
 expect(result.filter(item=>item.full_name.includes('H2H')).map(item=>item.full_name)).toEqual(['org/H2H'])
 expect(read).toHaveBeenCalledTimes(2)
})
