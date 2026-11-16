import { lazy, Suspense } from 'react'
import type { CodeViewerProps } from '../types/CodeViewerProps'
const MonacoCodeViewer = lazy(() => import('./MonacoCodeViewer'))
export default function CodeViewer(props: CodeViewerProps) {
 return <Suspense fallback={<div className="h-36 min-w-0 animate-pulse rounded-xl bg-base-200" aria-busy="true"/>}><MonacoCodeViewer {...props}/></Suspense>
}
