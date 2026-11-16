// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import LoginPage from '../src/pages/LoginPage'
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({status:'anonymous',notice:null})}))
vi.mock('../src/hooks/useBranding',()=>({useBranding:()=>({name:'Infinitech'})}))
vi.mock('../src/hooks/useAuthenticationMethods',()=>({useAuthenticationMethods:()=>({methods:{local_enabled:true,oidc:[{id:'idp_example',name:'Microsoft Entra ID'}]},retry:vi.fn(),error:null})}))
it('shows access help alongside the corporate sign-in button',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><LoginPage/></MemoryRouter>)
 expect(html).toContain('Continuar con Microsoft Entra ID')
 expect(html).toContain('¿Necesitas acceso?')
 expect(html).toContain('Contacta a tu administrador.')
})
