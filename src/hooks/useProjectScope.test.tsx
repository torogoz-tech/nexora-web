// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Link, MemoryRouter, Route, Routes, useSearchParams } from 'react-router'
import { useProjectScope } from './useProjectScope'
vi.mock('./useProjects', () => ({useProjects: () => ({projects:[{id:'one',name:'One'},{id:'two',name:'Two'}],status:'ready'})}))
vi.mock('./useApiData', () => ({useApiData: () => ({data:null,loading:false,error:null})}))
afterEach(() => {cleanup(); sessionStorage.clear(); localStorage.clear()})
function Scope() {
 const scope=useProjectScope(true)
 const [,setParams]=useSearchParams()
 return <><output data-testid="scope">{scope.projectId}</output><button onClick={()=>setParams({project:'two'})}>Select two</button><button onClick={()=>setParams({project:'organization'})}>General</button><Link to="/knowledge/rules">Rules</Link><Link to="/knowledge">Documents</Link><Link to="/code">Code</Link><Link to="/tasks">Tasks</Link></>
}
function mount(path='/knowledge') {return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={<Scope/>}/></Routes></MemoryRouter>)}
it('preserves the selected project between knowledge pages and remounts', () => {
 const view=mount()
 fireEvent.click(screen.getByText('Select two'))
 fireEvent.click(screen.getByText('Rules'))
 expect(screen.getByTestId('scope').textContent).toBe('two')
 view.unmount()
 mount()
 expect(screen.getByTestId('scope').textContent).toBe('two')
})
it('preserves general knowledge and lets explicit project links replace it', () => {
 const view=mount()
 fireEvent.click(screen.getByText('General'))
 fireEvent.click(screen.getByText('Rules'))
 expect(screen.getByTestId('scope').textContent).toBe('organization')
 view.unmount()
 mount('/knowledge?project=two')
 fireEvent.click(screen.getByText('Rules'))
 expect(screen.getByTestId('scope').textContent).toBe('two')
})

it('retains the project across Knowledge, Code and Tasks, and respects explicit URLs', () => {
 const view=mount('/knowledge?project=two')
 fireEvent.click(screen.getByText('Code'))
 expect(screen.getByTestId('scope').textContent).toBe('two')
 fireEvent.click(screen.getByText('Tasks'))
 expect(screen.getByTestId('scope').textContent).toBe('two')
 view.unmount()
 mount('/tasks?project=one')
 fireEvent.click(screen.getByText('Documents'))
 expect(screen.getByTestId('scope').textContent).toBe('one')
})
