export function workIntervalMinutes(start: string, end: string, nextDay: boolean): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) return null
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  const minutes = endHour * 60 + endMinute - startHour * 60 - startMinute + (nextDay ? 1440 : 0)
  return minutes > 0 && minutes <= 1440 ? minutes : null
}
