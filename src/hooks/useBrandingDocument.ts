import { useEffect } from 'react'
import type { OrganizationBranding } from '../types/OrganizationBranding'

export function useBrandingDocument(brand: OrganizationBranding) {
  useEffect(() => {
    document.title = brand.name.trim() || 'Nexora'
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!icon) {
      icon = document.createElement('link')
      icon.rel = 'icon'
      document.head.append(icon)
    }
    icon.type = brand.has_logo ? 'image/png' : 'image/svg+xml'
    icon.href = brand.has_logo
      ? `/api/v1/public/organization/logo?revision=${brand.revision}`
      : '/favicon.svg'
  }, [brand.name, brand.has_logo, brand.revision])
}
