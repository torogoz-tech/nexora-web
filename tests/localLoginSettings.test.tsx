import { expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import LocalLoginSettings from '../src/components/LocalLoginSettings'
import { parseOidcSettingsPage } from '../src/utils/parseOidcSettingsPage'
import { parseIssuedSession } from '../src/utils/parseIssuedSession'
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({logout:vi.fn()})}))
const settings={items:[],allowed_provider_origins:[],allowed_callback_origins:['https://web.example'],local_enabled:true,policy_revision:1,can_disable_local:false}
it('keeps passwords enabled until an administrator has verified corporate sign-in',()=>{
 const html=renderToStaticMarkup(<LocalLoginSettings settings={settings} onUpdated={()=>{}}/> )
 expect(html).toContain('disabled=""')
 expect(html).toContain('checked=""')
 expect(html).toContain('Mantén el acceso con contraseña')
})
it('offers an independent password control when corporate access is verified',()=>{
 const html=renderToStaticMarkup(<LocalLoginSettings settings={{...settings,can_disable_local:true}} onUpdated={()=>{}}/> )
 expect(html).not.toContain('disabled=""')
 expect(html).toContain('Puedes deshabilitar el acceso con contraseña')
})
it('retains the server callback and restricted login stage without retaining setup secrets',()=>{
 expect(parseOidcSettingsPage({...settings,callback_url:'https://web.example/api/v1/auth/oidc/callback'}).callback_url).toBe('https://web.example/api/v1/auth/oidc/callback')
 const session=parseIssuedSession({access_token:'nxs_challenge',actor_id:'actor',token_type:'Bearer',expires_in:900,next_step:'pending_role',secret:'never-retain'})
 expect(session.nextStep).toBe('pending_role')
 expect(session).not.toHaveProperty('secret')
})
