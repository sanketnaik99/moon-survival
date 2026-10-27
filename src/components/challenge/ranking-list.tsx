import {
  SortableList,
  SortableListGroup,
  SortableListHandle,
  SortableListItem,
  SortableListItemContent,
  SortableListUndo,
} from '#/components/motion/sortable-list'
import { ITEMS_BY_ID } from '#/lib/nasa'
import { ItemImage } from '#/components/challenge/item-image'

interface RankingListProps {
  order: string[]
  onChange: (order: string[]) => void
  label: string
  disabled?: boolean
}

export function RankingList({
  order,
  onChange,
  label,
  disabled,
}: RankingListProps) {
  const items = order.map((id) => ({ id, name: ITEMS_BY_ID[id].name }))

  return (
    <SortableList
      items={items}
      onItemsChange={(next) => onChange(next.map((item) => item.id))}
      getItemLabel={(item) => item.name}
      label={label}
      disabled={disabled}
      className="max-w-none"
    >
      {(current) => (
        <>
          <div className="mb-2 flex justify-between px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span>1 · Most important</span>
          </div>
          <SortableListGroup>
            {current.map((item, index) => (
              <SortableListItem
                key={item.id}
                id={item.id}
                className="min-h-16 bg-card"
              >
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground tabular-nums"
                >
                  {index + 1}
                </span>
                <ItemImage id={item.id} />
                <SortableListItemContent className="text-[15px] leading-snug font-medium">
                  {item.name}
                </SortableListItemContent>
                <SortableListHandle className="size-11" />
              </SortableListItem>
            ))}
          </SortableListGroup>
          <div className="mt-2 flex items-center justify-between px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span>15 · Least important</span>
            {!disabled && <SortableListUndo className="mt-0 normal-case" />}
          </div>
        </>
      )}
    </SortableList>
  )
}
