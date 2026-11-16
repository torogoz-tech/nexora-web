export function markdownImage(url: string, description: string) {
 const parsed = new URL(url)
 if (!['http:','https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw Error('Introduce una URL de imagen HTTP o HTTPS válida.')
 return `![${description.replace(/[[\]\r\n]/g, '')}](<${parsed.href.replace(/>/g, '%3E')}>)`
}
