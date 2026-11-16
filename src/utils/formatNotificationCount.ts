export function formatNotificationCount(count?: number): string | null {
  if (count === undefined || !Number.isInteger(count) || count <= 0) return null
  return count > 9 ? '+9' : String(count)
}
