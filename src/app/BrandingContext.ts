import { createContext } from 'react'
import type { OrganizationBranding } from '../types/OrganizationBranding'
export const BrandingContext = createContext<OrganizationBranding>({
  name: '',
  has_logo: false,
  revision: 0,
})
