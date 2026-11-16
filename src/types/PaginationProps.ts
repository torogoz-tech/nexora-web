export type PaginationProps = {
 compact?: boolean
 page?: number
 hasPrevious?: boolean
 hasNext: boolean
 onPrevious: ()=>void
 onNext: ()=>void
 count?: number
 total?: number
 totalPages?: number
 onPage?: (page:number)=>void
 busy?: boolean
 label?: string
}
