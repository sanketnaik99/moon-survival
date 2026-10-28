import { Link } from '@tanstack/react-router'
import { Check, Lock, Rocket } from 'lucide-react'
import { cn } from '#/lib/utils'

interface RoundNavProps {
  /** Omit for solo play, which links to /play/* instead of a session. */
  code?: string
  current: 'individual' | 'team'
  myLocked: boolean
  teamLocked: boolean
}

export function RoundNav({
  code,
  current,
  myLocked,
  teamLocked,
}: RoundNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-2 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-base font-bold text-primary"
        >
          <Rocket className="size-4" aria-hidden="true" />
          <span className="max-[380px]:sr-only">Moon Survival</span>
          {!code && (
            <span className="text-xs font-semibold text-muted-foreground">
              Solo
            </span>
          )}
        </Link>
        <nav aria-label="Rounds" className="flex gap-1">
          <RoundLink
            code={code}
            to="/s/$code/individual"
            active={current === 'individual'}
            label="Individual"
            done={myLocked}
          />
          <RoundLink
            code={code}
            to="/s/$code/team"
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
  code,
  to,
  active,
  label,
  done,
  locked,
}: {
  code?: string
  to: '/s/$code/individual' | '/s/$code/team'
  active: boolean
  label: string
  done: boolean
  locked?: boolean
}) {
  const className = cn(
    'flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-accent',
  )
  const content = (
    <>
      {label}
      {done ? (
        <Check className="size-3.5" aria-label="done" />
      ) : locked ? (
        <Lock className="size-3.5" aria-label="locked" />
      ) : null}
    </>
  )
  const current = active ? 'page' : undefined

  if (!code) {
    return (
      <Link
        to={to === '/s/$code/team' ? '/play/team' : '/play/individual'}
        aria-current={current}
        className={className}
      >
        {content}
      </Link>
    )
  }
  return (
    <Link
      to={to}
      params={{ code }}
      aria-current={current}
      className={className}
    >
      {content}
    </Link>
  )
}
