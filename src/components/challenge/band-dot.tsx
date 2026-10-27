import { getBand } from '#/lib/nasa'
import type { BandTone } from '#/lib/nasa'
import { cn } from '#/lib/utils'

export const TONE_BG: Record<BandTone, string> = {
  excellent: 'bg-band-excellent',
  good: 'bg-band-good',
  average: 'bg-band-average',
  fair: 'bg-band-fair',
  poor: 'bg-band-poor',
  'very-poor': 'bg-band-very-poor',
}

/** Coloured dot (plus label) for the band a score falls in. */
export function BandDot({
  total,
  showLabel = false,
  className,
}: {
  total: number
  showLabel?: boolean
  className?: string
}) {
  const band = getBand(total)
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn('size-3 shrink-0 rounded-full', TONE_BG[band.tone])}
        role={showLabel ? undefined : 'img'}
        aria-label={showLabel ? undefined : band.label}
        aria-hidden={showLabel ? true : undefined}
      />
      {showLabel && band.label}
    </span>
  )
}
