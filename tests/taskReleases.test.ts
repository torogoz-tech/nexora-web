import {describe,it,expect} from 'vitest'
import {parseTaskRelease} from '../src/utils/parseTaskRelease'
import {parseTaskReleases} from '../src/utils/parseTaskReleases'
describe('selected task release contract',()=>{
 const release={id:'r',project_id:'p',version:'1.0',branch_name:'release/1.0',status:'prepared',revision:1,created_at:'2026-11-11T12:00:00Z',created_by:'a',published_at:null,tasks:[{task_id:'t',task_revision:7}],repositories:[{repository_id:'repo',head_sha:'a'.repeat(40)}]}
 it('retains exact task and repository pins for review',()=>{expect(parseTaskRelease(release).tasks?.[0]?.task_revision).toBe(7);expect(parseTaskReleases({items:[release]}).items).toHaveLength(1)})
 it('rejects invalid lifecycle, mutable revision and abbreviated commit pins',()=>{for(const patch of [{status:'deployed'},{revision:0},{tasks:[{task_id:'t',task_revision:0}]},{repositories:[{repository_id:'repo',head_sha:'abc123'}]}])expect(()=>parseTaskRelease({...release,...patch})).toThrow()})
})
