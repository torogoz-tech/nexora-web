import type { OidcProvider } from './OidcProvider'
export type OidcProviderCreateFormProps = { onCreated:(provider:OidcProvider)=>void; onCancel:()=>void; callback:string }
