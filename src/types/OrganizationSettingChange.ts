import type { OrganizationField } from './OrganizationField'
export type OrganizationSettingChange =
  | { field: OrganizationField; value: string }
  | { field: 'logo'; value: string | null }
