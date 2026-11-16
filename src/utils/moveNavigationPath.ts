export function moveNavigationPath(paths: string[], from: string, to: string): string[] {
 const source=paths.indexOf(from),target=paths.indexOf(to)
 if(source<0||target<0||source===target) return [...paths]
 const result=[...paths];result.splice(source,1);result.splice(target,0,from);return result
}
