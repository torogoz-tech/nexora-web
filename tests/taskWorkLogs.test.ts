import {describe,it,expect} from 'vitest'
import {parseTaskWorkLogs} from '../src/utils/parseTaskWorkLogs'
describe('manual work log response',()=>{
 const log={id:'w',task_id:'t',actor_id:'a',date:'2026-11-09',minutes:75,note:null,overtime_request_id:null,revision:1,created_at:'2026-11-09T10:00:00Z',updated_at:'2026-11-09T10:00:00Z'}
 it('accepts dated regular and explicitly approved overtime work',()=>{expect(parseTaskWorkLogs([log,{...log,id:'extra',overtime_request_id:'approved'}])).toHaveLength(2)})
 it('rejects impossible dates, invalid durations and missing revision',()=>{for(const patch of [{date:'2026-02-30'},{minutes:0},{minutes:1441},{minutes:1.5},{revision:0},{overtime_request_id:4}])expect(()=>parseTaskWorkLogs([{...log,...patch}])).toThrow()})
})
