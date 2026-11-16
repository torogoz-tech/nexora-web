import type { PersonalMcpKeyMetadata } from './PersonalMcpKeyMetadata'
export type PersonalMcpKeyRowProps = {
 item: PersonalMcpKeyMetadata
 projects: {id:string;name:string}[]
 now: string
 busy?: boolean
 onRevoke?: (item:PersonalMcpKeyMetadata)=>void
}
