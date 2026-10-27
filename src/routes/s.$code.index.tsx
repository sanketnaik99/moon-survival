import {
  getRouteApi,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Scenario } from '#/components/challenge/scenario'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  saveParticipantId,
  useSessionChallenge,
} from '#/hooks/use-session-challenge'
import { joinSession } from '#/server/participant'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/s/$code/')({
  head: () => ({ meta: [{ title: 'Join · Moon Survival' }] }),
  component: JoinPage,
})

const sessionRoute = getRouteApi('/s/$code')

function JoinPage() {
  const { code } = Route.useParams()
  const session = sessionRoute.useLoaderData()!
  const navigate = useNavigate()
  const challenge = useSessionChallenge(code)
  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Returning participants skip straight to the exercise.
  useEffect(() => {
    if (challenge.hydrated && challenge.joined) {
      void navigate({
        to: '/s/$code/individual',
        params: { code },
        replace: true,
      })
    }
  }, [challenge.hydrated, challenge.joined, code, navigate])

  const canJoin = name.trim() !== '' && teamId !== '' && !pending

  const join = async () => {
    setPending(true)
    setError(null)
    try {
      const { participantId } = await joinSession({
        data: { code, name, teamId },
      })
      saveParticipantId(code, participantId)
      await navigate({ to: '/s/$code/individual', params: { code } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join')
      setPending(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 pb-12">
      <Scenario />

      {!challenge.hydrated || challenge.joined ? (
        <div className="h-56 animate-pulse rounded-xl bg-muted" />
      ) : session.closed ? (
        <div className="space-y-1 rounded-xl border bg-card p-5">
          <h2 className="font-display text-xl font-bold">Session closed</h2>
          <p className="text-sm text-muted-foreground">
            This session is no longer accepting new players.
          </p>
        </div>
      ) : (
        <form
          className="mx-auto w-full max-w-lg space-y-5 rounded-xl border bg-card p-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (canJoin) void join()
          }}
        >
          <div>
            <h2 className="font-display text-xl font-bold">
              Join {session.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your name and pick your team.
            </p>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold">
            Your name
            <Input
              value={name}
              autoComplete="name"
              required
              maxLength={60}
              placeholder="e.g. Alex"
              className="h-11"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <fieldset className="grid gap-2">
            <legend className="mb-1.5 text-sm font-semibold">Your team</legend>
            {session.teams.map((team) => (
              <label
                key={team.id}
                className={cn(
                  'flex h-11 cursor-pointer items-center gap-3 rounded-lg border bg-background px-3 text-sm font-medium',
                  teamId === team.id && 'border-primary ring-1 ring-primary',
                )}
              >
                <input
                  type="radio"
                  name="team"
                  value={team.id}
                  checked={teamId === team.id}
                  onChange={() => setTeamId(team.id)}
                  className="size-4 accent-primary"
                />
                {team.name}
              </label>
            ))}
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="h-11 w-full" disabled={!canJoin}>
            {pending ? 'Joining…' : 'Join and start'}
          </Button>
        </form>
      )}
    </main>
  )
}
