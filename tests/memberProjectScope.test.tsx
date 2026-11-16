// @vitest-environment jsdom
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
import MemberRoleModal from '../src/components/MemberRoleModal'
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'lead'}})}))
vi.mock('../src/services/getMemberRole',()=>({getMemberRole:async()=>({role:'developer',all_projects:false,project_ids:['project'],revision:1})}))
vi.mock('../src/services/getProjects',()=>({getProjects:async()=>({items:[{id:'project',name:'Project',archived:false}],next_cursor:null})}))
vi.mock('../src/components/IntegrationDialog',()=>({default:({title,children}:{title:string;children:React.ReactNode})=><section aria-label={title}>{children}</section>}))
afterEach(cleanup)
it('shows only project scope to technical leads, without a role selector',async()=>{
 render(<WorkspacePermissionsContext.Provider value={{actor_id:'lead',role:'technical_lead',grants:[{capability:'member-projects:manage',project_id:'project'}]}}><MemberRoleModal member={{id:'member',name:'Ana'} as never} onClose={()=>{}} onSaved={()=>{}}/></WorkspacePermissionsContext.Provider>)
 await waitFor(()=>expect(screen.getByText('Alcance de proyectos')).toBeTruthy())
 expect(screen.queryByRole('combobox',{name:'Rol'})).toBeNull()
 expect((screen.getByLabelText('Todos los proyectos, incluidos los futuros') as HTMLInputElement).disabled).toBe(true)
})
