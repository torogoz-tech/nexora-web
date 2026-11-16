import type { ServiceRequest } from './ServiceRequest'
export type ServiceRequestReport = {
 total:number; summary:{new:number;in_progress:number;completed:number;response_breached:number;resolution_breached:number;sla_count:number;response_average_minutes:number|null;resolution_average_minutes:number|null};
 items:ServiceRequest[]; products:{product_id:string|null;name:string;total:number;pending:number}[];
 types:{type_id:string;name:string;total:number}[];requesters:{id:string;name:string}[];
 oldest_pending:{id:string;number:number;title:string;created_at:string}[];
}
