import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Checkbox } from '#/components/ui/checkbox'

interface ConfirmLockDialogProps {
  trigger: ReactNode
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  /** When set, the confirm button stays disabled until this is checked. */
  requireAck?: string
  onConfirm: () => void
}

export function ConfirmLockDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Keep editing',
  requireAck,
  onConfirm,
}: ConfirmLockDialogProps) {
  const [acked, setAcked] = useState(false)
  const ackId = useId()

  return (
    <AlertDialog onOpenChange={(open) => open && setAcked(false)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requireAck && (
          <label
            htmlFor={ackId}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2 text-sm"
          >
            <Checkbox
              id={ackId}
              checked={acked}
              onCheckedChange={(value) => setAcked(value === true)}
            />
            {requireAck}
          </label>
        )}
        <AlertDialogFooter className="max-sm:gap-2">
          <AlertDialogCancel className="h-11 sm:h-9">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-11 sm:h-9"
            disabled={Boolean(requireAck) && !acked}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
