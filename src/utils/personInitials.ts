export function personInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return words.length
    ? `${Array.from(words[0])[0] ?? ''}${words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : (Array.from(words[0])[1] ?? '')}`.toLocaleUpperCase()
    : '?'
}
