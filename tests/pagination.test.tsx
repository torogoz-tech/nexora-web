import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import Pagination from '../src/components/Pagination'
import { paginationPages } from '../src/utils/paginationPages'
import { canOpenWorkspacePath } from '../src/utils/canOpenWorkspacePath'
import { getReturnPath } from '../src/utils/getReturnPath'
it('shows the current page, result count and explicit disabled navigation at the boundaries',()=>{
 const html=renderToStaticMarkup(createElement(Pagination,{page:1,count:20,hasNext:false,onPrevious:()=>{},onNext:()=>{}}))
 expect(html).toContain('Página 1')
 expect(html).toContain('20 resultados en esta página')
 expect(html.match(/disabled=""/g)).toHaveLength(2)
 expect(html).not.toContain('de 1')
})
it('bounds numbered navigation without inventing a total for cursor pages',()=>{
 expect(paginationPages(8,20)).toEqual([1,'gap',7,8,9,'gap',20])
 const html=renderToStaticMarkup(createElement(Pagination,{page:8,totalPages:20,hasNext:true,onPage:()=>{},onPrevious:()=>{},onNext:()=>{}}))
 expect(html).toContain('aria-current="page"')
 expect(html.match(/Ir a la página/g)?.length).toBe(5)
})
it('allows a developer to open only personal MCP settings without adding administrative grants',()=>{
 const permissions={actor_id:'developer',role:'developer' as const,grants:[]}
 expect(canOpenWorkspacePath('/settings/mcp',permissions)).toBe(true)
 expect(canOpenWorkspacePath('/settings/mcp/history',permissions)).toBe(true)
 expect(canOpenWorkspacePath('/settings/members',permissions)).toBe(false)
 expect(canOpenWorkspacePath('/settings/openai',permissions)).toBe(false)
 expect(getReturnPath('/settings/mcp/history')).toBe('/settings/mcp/history')
})

it('labels an unknown deep cursor honestly and offers a return to the beginning',()=>{
 const html=renderToStaticMarkup(createElement(Pagination,{hasPrevious:true,hasNext:true,onPrevious:()=>{},onNext:()=>{}}))
 expect(html).toContain('Página actual')
 expect(html).toContain('Volver al inicio')
 expect(html).not.toContain('Página anterior')
})
