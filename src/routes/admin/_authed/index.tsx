import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { BandDot } from '#/components/challenge/band-dot'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { createSession, listSessions } from '#/server/admin'

export const Route = createFileRoute('/admin/_authed/')({
  loader: () => listSessions(),
  head: () => ({ meta: [{ title: 'Admin · Moon Survival' }] }),
  component: AdminHome,
})

function AdminHome() {
  const sessions = Route.useLoaderData()
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6">
      <NewSession />
      <section className="space-y-3" aria-labelledby="history-heading">
        <h2 id="history-heading" className="font-display text-2xl font-bold">
          Sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            No sessions yet. Create one above.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  to="/admin/sessions/$sessionId"
                  params={{ sessionId: s.id }}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:bg-accent/50"
                >
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <time suppressHydrationWarning>
                        {new Date(s.createdAt).toLocaleString()}
                      </time>{' '}
                      · code {s.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm tabular-nums">
                    <span className="text-muted-foreground">
                      {s.finished}/{s.joined} finished
                    </span>
                    <Avg label="You" value={s.avgIndividual} />
                    <Avg label="Team" value={s.avgTeam} />
                    <span className="rounded-full border px-2 py-0.5 text-xs font-semibold">
                      {s.closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

function Avg({ label, value }: { label: string; value: number | null }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">avg {label}</span>
      {value === null ? (
        '–'
      ) : (
        <>
          {value}
          <BandDot total={value} />
        </>
      )}
    </span>
  )
}

function NewSession() {
  const navigate = useNavigate()
  const router = useRouter()
  const [name, setName] = useState('')
  const [teams, setTeams] = useState(['Team 1', 'Team 2'])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleaned = teams.map((t) => t.trim()).filter(Boolean)
  const canCreate = name.trim() !== '' && cleaned.length > 0 && !pending

  return (
    <form
      className="space-y-4 rounded-xl border bg-card p-5"
      onSubmit={async (event) => {
        event.preventDefault()
        if (!canCreate) return
        setPending(true)
        setError(null)
        try {
          const { id } = await createSession({ data: { name, teams: cleaned } })
          await router.invalidate()
          await navigate({
            to: '/admin/sessions/$sessionId',
            params: { sessionId: id },
          })
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not create session')
          setPending(false)
        }
      }}
    >
      <h1 className="font-display text-2xl font-bold">New session</h1>
      <label className="grid gap-1.5 text-sm font-semibold">
        Session name
        <Input
          value={name}
          placeholder="e.g. Ops offsite, Oct 27"
          className="h-11"
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-semibold">Teams</legend>
        {teams.map((team, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={team}
              aria-label={`Team ${index + 1} name`}
              className="h-11"
              onChange={(event) =>
                setTeams(
                  teams.map((t, i) => (i === index ? event.target.value : t)),
                )
              }
            />
            <Button
              type="button"
              variant="outline"
              className="size-11 shrink-0 p-0"
              aria-label={`Remove team ${index + 1}`}
              disabled={teams.length === 1}
              onClick={() => setTeams(teams.filter((_, i) => i !== index))}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="h-11 w-fit"
          onClick={() => setTeams([...teams, `Team ${teams.length + 1}`])}
        >
          <Plus /> Add team
        </Button>
      </fieldset>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-11" disabled={!canCreate}>
        Create session
      </Button>
    </form>
  )
}
