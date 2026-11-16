import {parseRepositoryPage} from './parseRepositoryPage'
export function parseRepositoryWorkCatalog(value:unknown){
 const page=parseRepositoryPage(value)
 return {items:page.items,next_after:page.next_cursor}
}
