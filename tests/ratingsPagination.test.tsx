// @vitest-environment jsdom
import {afterEach,describe,it,expect,vi} from 'vitest'
import {render,fireEvent,cleanup} from '@testing-library/react'
import {MemoryRouter} from 'react-router'
import DeveloperRatings from '../src/components/DeveloperRatings'
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({loading:false,error:null,data:{annual:4,can_rate:false,daily:Array.from({length:25},(_,i)=>({date:`2026-01-${String(i+1).padStart(2,'0')}`,score:4,entries:[],excluded:false})),weekly:[{period:'2026-W01',score:4}],monthly:[{period:'2026-01',score:4}]},reload:vi.fn()})}))
afterEach(cleanup)
describe('rating pagination',()=>{
 it('shows twenty days at a time and resets pagination on period changes without changing the annual score',()=>{
  const view=render(<MemoryRouter><DeveloperRatings actorId="target" year={2026} projects={[]}/></MemoryRouter>)
  expect(view.container.querySelectorAll('details')).toHaveLength(20)
  expect(view.container.querySelector('.max-h-96')).toBeNull()
  fireEvent.click(view.getByRole('button',{name:'Página siguiente'}));expect(view.container.querySelectorAll('details')).toHaveLength(5)
  expect(view.getByText('Página 2')).toBeTruthy()
  fireEvent.click(view.getByRole('tab',{name:'Semanal'}));expect(view.getByText('Página 1')).toBeTruthy();expect(view.getByText('2026-W01')).toBeTruthy()
  expect(view.getByText(/Promedio anual/)).toBeTruthy()
 })
})
