import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Check, Copy, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BandDot } from '#/components/challenge/band-dot'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useSessionSocket } from '#/hooks/use-session-socket'
import { addTeam, getSessionDashboard, setSessionClosed } from '#/server/admin'

export const Route = createFileRoute('/admin/_authed/sessions/$sessionId')({
  loader: ({ params }) =>
    getSessionDashboard({ data: { sessionId: params.sessionId } }),
  head: () => ({ meta: [{ title: 'Session · Moon Survival' }] }),
  component: SessionDashboard,
})

function SessionDashboard() {
  const dashboard = Route.useLoaderData()
  const router = useRouter()

  // Every event just refetches the dashboard, so there's no partial state to merge.
  useSessionSocket(dashboard?.id ?? null, null, () => {
    void router.invalidate()
  })

  if (!dashboard) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <p className="rounded-xl border bg-card p-4 text-sm">
          Session not found.{' '}
          <Link to="/admin" className="font-semibold text-primary underline">
            Back to sessions
          </Link>
        </p>
      </main>
    )
  }

  // Origin is only known in the browser; set after mount so SSR and hydration match.
  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(window.location.origin), [])
  const link = `${origin}/s/${dashboard.code}`

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All sessions
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold">{dashboard.name}</h1>
          <p className="text-sm text-muted-foreground">
            Created{' '}
            <time suppressHydrationWarning>
              {new Date(dashboard.createdAt).toLocaleString()}
            </time>{' '}
            · {dashboard.closed ? 'Closed' : 'Open'}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11"
          onClick={async () => {
            await setSessionClosed({
              data: { sessionId: dashboard.id, closed: !dashboard.closed },
            })
            await router.invalidate()
          }}
        >
          {dashboard.closed ? 'Reopen session' : 'Close session'}
        </Button>
      </header>

      <ShareCard code={dashboard.code} link={link} />

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Joined" value={dashboard.joined} />
        <Stat label="Finished" value={dashboard.finished} />
        <Stat label="Avg individual" value={dashboard.avgIndividual} band />
        <Stat label="Avg team" value={dashboard.avgTeam} band />
      </dl>
      {dashboard.finished > 0 && (
        <p className="text-sm text-muted-foreground">
          The team beat the individual in {dashboard.teamBeatCount} of{' '}
          {dashboard.finished} cases. Lower scores are better. Scores appear
          once a person and their team have both locked in.
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-2" aria-label="Teams">
        {dashboard.teams.map((team) => (
          <article
            key={team.id}
            className="space-y-3 rounded-xl border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">{team.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {team.joined} joined
                  {team.lockedBy ? ` · locked by ${team.lockedBy}` : ''}
                </p>
              </div>
              {team.teamScore === null ? (
                <p className="text-sm text-muted-foreground">
                  Waiting for team
                </p>
              ) : (
                <p className="flex items-center gap-2 text-right">
                  <span className="font-display text-3xl leading-none font-bold tabular-nums">
                    {team.teamScore}
                  </span>
                  <BandDot
                    total={team.teamScore}
                    showLabel
                    className="text-sm font-semibold"
                  />
                </p>
              )}
            </div>

            {team.members.length > 0 && (
              <table className="w-full text-sm">
                <thead className="text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="py-1 font-semibold">Name</th>
                    <th className="py-1 text-right font-semibold">Score</th>
                    <th className="py-1 text-right font-semibold">vs team</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {team.members.map((m) => {
                    const delta = m.score - (team.teamScore ?? m.score)
                    return (
                      <tr key={m.id}>
                        <td className="py-2 pr-2">{m.name}</td>
                        <td className="py-2 text-right tabular-nums">
                          <span className="inline-flex items-center gap-2">
                            {m.score}
                            <BandDot total={m.score} />
                          </span>
                        </td>
                        <td className="py-2 text-right text-muted-foreground tabular-nums">
                          {delta === 0
                            ? 'same'
                            : delta > 0
                              ? `+${delta}`
                              : delta}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </article>
        ))}
      </section>

      <AddTeam sessionId={dashboard.id} />
    </main>
  )
}

function Stat({
  label,
  value,
  band,
}: {
  label: string
  value: number | null
  band?: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-2 font-display text-3xl leading-none font-bold tabular-nums">
        {value ?? '–'}
        {band && value !== null && <BandDot total={value} />}
      </dd>
    </div>
  )
}

function ShareCard({ code, link }: { code: string; link: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Share this link
        </p>
        <p className="truncate text-sm font-medium">{link}</p>
      </div>
      <p
        className="font-mono text-2xl font-bold tracking-widest"
        aria-label={`Session code ${code}`}
      >
        {code}
      </p>
      <Button
        className="h-11"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {
            // Clipboard blocked; the link is visible to copy by hand.
          }
        }}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? 'Copied' : 'Copy link'}
      </Button>
    </div>
  )
}

function AddTeam({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  return (
    <form
      className="flex gap-2"
      onSubmit={async (event) => {
        event.preventDefault()
        if (!name.trim()) return
        await addTeam({ data: { sessionId, name } })
        setName('')
        await router.invalidate()
      }}
    >
      <Input
        value={name}
        placeholder="New team name"
        aria-label="New team name"
        className="h-11 max-w-xs"
        onChange={(event) => setName(event.target.value)}
      />
      <Button
        type="submit"
        variant="outline"
        className="h-11"
        disabled={!name.trim()}
      >
        <Plus /> Add team
      </Button>
    </form>
  )
}
