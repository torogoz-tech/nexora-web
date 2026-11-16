export function toMarkdownList(items: string[]): string {
  return items.map(item => {
    const text = item.trim()
    return /^[-+*]\s+|^\d+[.)]\s+/.test(text) ? text : `- ${text.replace(/\n/g, '\n  ')}`
  }).join('\n\n')
}
