// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { authContext } from '../app/authContext'
import { useProjectPreference } from './useProjectPreference'
afterEach(() => { cleanup(); localStorage.clear() })
function Selection({project}:{project:string|null}) { return <output>{useProjectPreference(project) ?? 'unset'}</output> }
function member(actorId:string,project:string|null) {
 return <authContext.Provider value={{session:{actorId,expiresAt:0},status:'authenticated',notice:null,acceptSession:()=>{},logout:async()=>{},retry:()=>{}}}><Selection project={project}/></authContext.Provider>
}
it('keeps explicit all-project selection after leaving the screen', () => {
 const view=render(member('alice',''))
 view.rerender(member('alice',null))
 expect(screen.getByRole('status').textContent).toBe('')
})
it('separates member preferences and follows cross-tab selection changes', () => {
 const view=render(member('alice','one'))
 view.rerender(member('bob',null))
 expect(screen.getByRole('status').textContent).toBe('unset')
 view.rerender(member('alice',null))
 expect(screen.getByRole('status').textContent).toBe('one')
 act(()=>{localStorage.setItem('nexora.project.alice','two');window.dispatchEvent(new Event('storage'))})
 expect(screen.getByRole('status').textContent).toBe('two')
 view.rerender(member('alice','three'))
 expect(screen.getByRole('status').textContent).toBe('three')
})
