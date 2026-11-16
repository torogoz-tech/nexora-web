import type { PageProps } from '../types/PageProps'

export default function Page({
  children,
  wide = false,
  fullWidth = false,
  viewport = false,
}: PageProps) {
  return (
    <div
      className={
        fullWidth
          ? viewport ? 'flex h-full min-h-0 w-full flex-col' : 'flex min-h-full w-full shrink-0 flex-col pb-[calc(3rem+env(safe-area-inset-bottom))]'
          : `mx-auto flex min-h-full w-full shrink-0 ${wide ? 'max-w-7xl' : 'max-w-3xl'} flex-col px-[clamp(1rem,2vw,2rem)] pt-[clamp(1rem,2vw,2rem)] pb-[calc(3rem+env(safe-area-inset-bottom))]`
      }
    >
      {children}
    </div>
  )
}
