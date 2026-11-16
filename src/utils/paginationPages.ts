export function paginationPages(page:number,total:number):(number|'gap')[]{
 const values=[...new Set([1,total,page-1,page,page+1].filter(value=>value>=1&&value<=total))].sort((a,b)=>a-b)
 return values.flatMap((value,index)=>index>0&&value-values[index-1]!>1?['gap' as const,value]:[value])
}
