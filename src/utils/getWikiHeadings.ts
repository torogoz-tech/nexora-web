import type { WikiHeading } from '../types/WikiHeading'
export function getWikiHeadings(text: string, prefix: string): WikiHeading[] {
  const result: WikiHeading[] = []
  let fence: { character: string; length: number } | null = null
  text.split('\n').forEach((line, index) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/)
    if (marker) {
      if (!fence) fence = { character: marker[1][0], length: marker[1].length }
      else if (
        marker[1][0] === fence.character &&
        marker[1].length >= fence.length &&
        !marker[2].trim()
      )
        fence = null
      return
    }
    if (fence) return
    const heading = line.match(/^ {0,3}(#{1,3})\s+(.+?)\s*#*\s*$/)
    if (heading)
      result.push({
        id: `${prefix}-line-${index + 1}`,
        title: heading[2]
          .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
          .replace(/[*`_]/g, ''),
        level: heading[1].length,
      })
  })
  return result
}
