export function transitionFailureMessage(code:string|null|undefined,fallback:string|null|undefined):string{
 const conditions:Record<string,string>={
  'complete all subtasks before completing this task':'Completa la etapa actual de todas las subtareas antes de avanzar la tarea principal.',
  'implementation subtask needs verified repository branch integration before the parent can finish':'Integra los cambios de las subtareas en la rama de la tarea principal antes de terminar la etapa.',
  'parent task branch is missing for subtask integration':'Falta preparar la rama de la tarea principal para integrar las subtareas.',
  'destination requires successful deployment of the exact merged revision':'La entrega requiere un despliegue exitoso del mismo commit integrado por la PR.',
  'destination requires a provider-confirmed merged pull request':'Integra la PR hacia la rama requerida por el workflow de destino antes de entregar.',
  'integrate the corrective revision back into develop before delivery':'Integra también la corrección en develop antes de devolverla al equipo de pruebas.',
 }
 if(fallback&&conditions[fallback])return conditions[fallback]!
 const messages:Record<string,string>={
  provider_confirmation_pending:'Esperando que Git confirme la integración, las comprobaciones o el despliegue requerido. La tarea conservará su estado hasta que se cumpla.',
  notification_delivery_failed:'El correo no pudo entregarse después de varios intentos. Reintenta la notificación para continuar desde el último paso confirmado.',
  human_approval_required:'Una persona autorizada debe aprobar esta solicitud antes de continuar.',
  task_revision_changed:'La tarea cambió desde que se solicitó el avance. Actualízala y revisa la transición.',
  provider_head_changed:'La rama cambió en Git. Consulta el commit actual y envía una nueva solicitud para revisarlo.',
  provider_outcome_unknown:'Git no confirmó el resultado de la PR. Revisa el repositorio antes de reintentar para evitar duplicados.',
  provider_resource_missing:'No se encontró una rama o recurso requerido en Git. Revisa las ramas y el acceso al repositorio.',
  transition_authority_changed:'Los permisos o la configuración cambiaron. Revisa el acceso antes de continuar.',
  transition_conflict:'No se cumplen las condiciones para avanzar. Revisa el estado, las dependencias y las ramas requeridas.',
  transition_validation:'La solicitud contiene datos inválidos. Revisa las reglas y los datos de la transición.',
  transition_storage_failure:'No se pudo guardar el avance. Puedes reintentar; se conservarán los pasos ya completados.',
 }
 return code&&messages[code]||fallback||''
}
