import { useBranding } from '../hooks/useBranding'
import NexoraLogo from './NexoraLogo'
export default function OrganizationMark() {
  const brand = useBranding()
  return brand.has_logo ? (
    <img
      src={`/api/v1/public/organization/logo?revision=${brand.revision}`}
      alt={brand.name}
      className="h-full w-full rounded-[inherit] object-contain p-[18%]"
    />
  ) : (
    <NexoraLogo />
  )
}
