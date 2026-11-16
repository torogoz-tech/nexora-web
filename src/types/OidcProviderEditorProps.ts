import type { OidcProvider } from './OidcProvider'
export type OidcProviderEditorProps = { provider:OidcProvider; onUpdated:(provider:OidcProvider)=>void; onReload:()=>void }
