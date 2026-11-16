export function calendarToday(timezone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const part = (key: string) => parts.find(item => item.type === key)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}
