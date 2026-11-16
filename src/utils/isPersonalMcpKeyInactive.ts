import type { PersonalMcpKeyMetadata } from '../types/PersonalMcpKeyMetadata'
import { personalMcpKeyStatus } from './personalMcpKeyStatus'
export function isPersonalMcpKeyInactive(key:PersonalMcpKeyMetadata,now:string){
 const status=personalMcpKeyStatus(key,now)
 return status==='Revocada'||status==='Vencida'
}
