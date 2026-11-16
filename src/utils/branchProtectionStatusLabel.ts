export function branchProtectionStatusLabel(status: string) {
 switch (status) {
  case 'unconfigured': return 'Sin configurar'
  case 'prepared': return 'Vista previa preparada'
  case 'applying': return 'Aplicando protección de ramas…'
  case 'applied': return 'Protección aplicada y verificada'
  case 'failed': return 'No se pudo verificar la protección'
  default: return 'Estado de protección pendiente de verificar'
 }
}
