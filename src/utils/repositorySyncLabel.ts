export function repositorySyncLabel(state:string|null) {
 switch(state){
  case 'queued':case 'pending':return 'En cola'
  case 'running':case 'leased':return 'En curso'
  case 'succeeded':case 'completed':return 'Completada'
  case 'failed':return 'Fallida'
  case 'cancelled':case 'canceled':return 'Cancelada'
  default:return 'Sin sincronizaciones registradas'
 }
}
