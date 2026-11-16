import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useBrandingDocument } from '../hooks/useBrandingDocument'
import { BrandingContext } from './BrandingContext'
import type { OrganizationBranding } from '../types/OrganizationBranding'
export default function BrandingProvider({
  children,
}: {
  children: ReactNode
}) {
  const [brand, setBrand] = useState<OrganizationBranding>({
    name: '',
    has_logo: false,
    revision: 0,
  })
  useBrandingDocument(brand)
  useEffect(() => {
    const controller = new AbortController()
    const refresh = () =>
      fetch('/api/v1/public/organization', {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15000),
        ]),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((v) => {
          if (
            !controller.signal.aborted &&
            typeof v.name === 'string' &&
            typeof v.has_logo === 'boolean' &&
            Number.isSafeInteger(v.revision) &&
            v.revision > 0
          )
            setBrand((old) => (old.revision > v.revision ? old : v))
        })
        .catch(() => {})
    const brandingChanged = (event: Event) => {
      const value = (event as CustomEvent<OrganizationBranding>).detail
      if (value && typeof value.name === 'string' && typeof value.has_logo === 'boolean' && Number.isSafeInteger(value.revision) && value.revision > 0)
        setBrand(old => old.revision > value.revision ? old : { name: value.name, has_logo: value.has_logo, revision: value.revision })
      void refresh()
    }
    const invalidate = (event: Event) => {
      if ((event as CustomEvent).detail?.topics?.includes('preferences'))
        void refresh()
    }
    void refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('nexora:branding', brandingChanged)
    window.addEventListener('nexora:invalidate', invalidate)
    return () => {
      controller.abort()
      window.removeEventListener('focus', refresh)
      window.removeEventListener('nexora:branding', brandingChanged)
      window.removeEventListener('nexora:invalidate', invalidate)
    }
  }, [])
  return (
    <BrandingContext.Provider value={brand}>
      {children}
    </BrandingContext.Provider>
  )
}
