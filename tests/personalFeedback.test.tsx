// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,render} from '@testing-library/react'
import PersonalRatingFeedback from '../src/components/PersonalRatingFeedback'
const state=vi.hoisted(()=>({fetch:vi.fn(),report:{summary:'Continúa documentando tus avances.',strengths:[],improvements:[],actions:[]}}))
vi.mock('../src/services/apiFetch',()=>({apiFetch:state.fetch}))
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({loading:false,error:null,reload:vi.fn(),data:{report:state.report}})}))
afterEach(cleanup)
it('keeps exactly one private Feedback and never generates on render or updates',()=>{
 const view=render(<PersonalRatingFeedback year={2026}/>)
 for(let i=0;i<20;i++)view.rerender(<PersonalRatingFeedback year={2026+i%2}/>)
 expect(view.getAllByRole('heading',{name:'Feedback'})).toHaveLength(1)
 expect(view.getAllByText(state.report.summary)).toHaveLength(1)
 expect(state.fetch).not.toHaveBeenCalled()
 expect(view.container.textContent).not.toContain('Resumen de IA')
})
