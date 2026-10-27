import { cn } from '#/lib/utils'

/** Illustration for a survival item, served from `public/items/<id>.png`. */
export function ItemImage({
  id,
  className,
}: {
  id: string
  className?: string
}) {
  return (
    <img
      src={`/items/${id}.png`}
      alt=""
      width={48}
      height={48}
      loading="lazy"
      draggable={false}
      className={cn('size-12 shrink-0 object-contain select-none', className)}
    />
  )
}
