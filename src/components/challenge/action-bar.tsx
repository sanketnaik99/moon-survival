import type { ReactNode } from 'react'

/** Sticky bottom bar; pages add bottom padding via `pb-28` so content isn't hidden. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  )
}
