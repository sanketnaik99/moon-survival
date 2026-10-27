import { Link } from '@tanstack/react-router'
import { Check, Lock, Rocket } from 'lucide-react'
import { cn } from '#/lib/utils'

interface RoundNavProps {
  current: 'individual' | 'team'
  myLocked: boolean
  teamLocked: boolean
}

export function RoundNav({ current, myLocked, teamLocked }: RoundNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-2 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-base font-bold text-primary"
        >
          <Rocket className="size-4" aria-hidden="true" />
          <span className="max-[380px]:sr-only">Moon Survival</span>
        </Link>
        <nav aria-label="Rounds" className="flex gap-1">
          <RoundLink
            to="/individual"
            active={current === 'individual'}
            label="Individual"
            done={myLocked}
          />
          <RoundLink
            to="/team"
            active={current === 'team'}
            label="Team"
            done={teamLocked}
            locked={!myLocked}
          />
        </nav>
      </div>
    </header>
  )
}

function RoundLink({
  to,
  active,
  label,
  done,
  locked,
}: {
  to: '/individual' | '/team'
  active: boolean
  label: string
  done: boolean
  locked?: boolean
}) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent',
      )}
    >
      {label}
      {done ? (
        <Check className="size-3.5" aria-label="done" />
      ) : locked ? (
        <Lock className="size-3.5" aria-label="locked" />
      ) : null}
    </Link>
  )
}
