import type { Dashboard } from '#/lib/session-types'
import { cn } from '#/lib/utils'

const MAX_SCORE = 112

interface Entry {
  key: string
  kind: 'team' | 'individual'
  label: string
  detail: string
  score: number
}

function buildEntries(dashboard: Dashboard): Entry[] {
  const entries: Entry[] = []
  for (const team of dashboard.teams) {
    if (team.teamScore === null) continue
    entries.push({
      key: `team-${team.id}`,
      kind: 'team',
      label: team.name,
      detail: 'Team',
      score: team.teamScore,
    })
    for (const member of team.members) {
      entries.push({
        key: `person-${member.id}`,
        kind: 'individual',
        label: member.name,
        detail: team.name,
        score: member.score,
      })
    }
  }
  // Lower is better, so the best score is at the top. Teams win ties.
  return entries.sort(
    (a, b) =>
      a.score - b.score || (a.kind === b.kind ? 0 : a.kind === 'team' ? -1 : 1),
  )
}

const KIND_BG = {
  team: 'bg-chart-team',
  individual: 'bg-chart-individual',
} as const

export function ScoreChart({ dashboard }: { dashboard: Dashboard }) {
  const entries = buildEntries(dashboard)

  return (
    <section
      className="space-y-3 rounded-xl border bg-card p-4"
      aria-labelledby="chart-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 id="chart-heading" className="text-lg font-bold">
          Scores
        </h2>
        <ul className="flex gap-4 text-xs font-semibold">
          {(['team', 'individual'] as const).map((kind) => (
            <li key={kind} className="flex items-center gap-1.5">
              <span
                className={cn('size-3 rounded-sm', KIND_BG[kind])}
                aria-hidden="true"
              />
              {kind === 'team' ? 'Team' : 'Individual'}
            </li>
          ))}
        </ul>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Scores show up here once a team locks in.
        </p>
      ) : (
        <>
          <ol className="space-y-2.5">
            {entries.map((entry) => (
              <li key={entry.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    <span
                      className={cn(
                        entry.kind === 'team' ? 'font-bold' : 'font-medium',
                      )}
                    >
                      {entry.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {' '}
                      · {entry.detail}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {entry.score}
                  </span>
                </div>
                <div
                  className="mt-1 h-3 rounded-sm bg-muted"
                  role="img"
                  aria-label={`${entry.label} (${entry.kind === 'team' ? 'team' : `individual, ${entry.detail}`}): ${entry.score}`}
                >
                  <div
                    className={cn('h-full rounded-sm', KIND_BG[entry.kind])}
                    style={{
                      width: `${Math.max(1, (entry.score / MAX_SCORE) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">
            Lower is better. Bars run from 0 to the maximum score of {MAX_SCORE}
            .
          </p>
        </>
      )}
    </section>
  )
}
