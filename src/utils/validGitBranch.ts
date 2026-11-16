export function validGitBranch(value:string):boolean{
 return value.length>0&&value.length<=255&&!value.startsWith('-')&&!value.startsWith('/')&&!value.endsWith('/')&&!value.endsWith('.')&&!value.includes('..')&&!value.includes('@{')&&value!=='@'&&![...value].some(char=>char.charCodeAt(0)<32||char.charCodeAt(0)===127||' ~^:?*[\\'.includes(char))&&!/\s/.test(value)&&value.split('/').every(part=>part!==''&&!part.startsWith('.')&&!part.endsWith('.lock'))
}
