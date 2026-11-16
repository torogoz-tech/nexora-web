import { useContext } from 'react'
import { BrandingContext } from '../app/BrandingContext'
export function useBranding() {
  return useContext(BrandingContext)
}
