import type { OidcProvider } from './OidcProvider'
export type AuthenticationMethods = {
  local_enabled: boolean
  oidc: OidcProvider[]
}
