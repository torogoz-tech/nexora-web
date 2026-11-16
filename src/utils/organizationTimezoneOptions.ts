export function organizationTimezoneOptions(current: string) {
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['America/El_Salvador', 'America/New_York', 'America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'Europe/London', 'Asia/Tokyo']
  return [...new Set(['UTC', current, ...zones])].sort().map(value => ({ value, label: value.replaceAll('_', ' ') }))
}
