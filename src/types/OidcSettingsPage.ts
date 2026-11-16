import type { OidcProvider } from './OidcProvider'
export type OidcSettingsPage = { items:OidcProvider[]; allowed_provider_origins:string[]; allowed_callback_origins:string[]; callback_url?:string; local_enabled?:boolean; policy_revision?:number; can_disable_local?:boolean }
