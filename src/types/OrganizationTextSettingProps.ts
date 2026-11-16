import type { OrganizationSettingProps } from './OrganizationSettingProps'
import type { OrganizationField } from './OrganizationField'
export type OrganizationTextSettingProps = OrganizationSettingProps & {
  field: Exclude<OrganizationField, 'country_code'>
  label: string
}
