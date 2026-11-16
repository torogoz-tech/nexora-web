// @vitest-environment jsdom
import {useEffect} from 'react'
import {it,expect,vi} from 'vitest'
import {render,waitFor} from '@testing-library/react'
import WikiMarkdown from '../src/components/WikiMarkdown'
const calls=vi.hoisted(()=>({mounted:vi.fn()}))
vi.mock('../src/components/TaskEvidenceImage',()=>({default:function EvidenceImage(){useEffect(()=>{calls.mounted()},[]);return <img alt="evidence"/>}}))
it('keeps evidence mounted when surrounding task metadata refreshes',async()=>{
 const props={text:'![evidence](/api/v1/task-evidence/tev_example/content)',allowImages:true}
 const view=render(<WikiMarkdown {...props}/> )
 await waitFor(()=>expect(view.getByAltText('evidence')).toBeTruthy())
 const before=calls.mounted.mock.calls.length
 view.rerender(<WikiMarkdown {...props}/> )
 expect(calls.mounted).toHaveBeenCalledTimes(before)
})
