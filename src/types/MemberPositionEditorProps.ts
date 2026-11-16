import type { OrganizationMember } from './OrganizationMember'
export type MemberPositionEditorProps = { member: OrganizationMember; onSaved: (position: string, revision: number) => void }
