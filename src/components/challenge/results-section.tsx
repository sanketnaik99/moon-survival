import { ChevronDown } from 'lucide-react'
import {
  DEBRIEF_QUESTIONS,
  ITEMS_BY_NASA_RANK,
  SCORE_BANDS,
  TAKEAWAY,
  getBand,
  scoreRanking,
} from '#/lib/nasa'
import type { BandTone } from '#/lib/nasa'
import { ItemImage } from '#/components/challenge/item-image'
import { cn } from '#/lib/utils'

const TONE_BG: Record<BandTone, string> = {
  excellent: 'bg-band-excellent',
  good: 'bg-band-good',
  average: 'bg-band-average',
  fair: 'bg-band-fair',
  poor: 'bg-band-poor',
  'very-poor': 'bg-band-very-poor',
}

interface ResultsSectionProps {
  myOrder: string[]
  teamOrder: string[]
  teamName: string
}

export function ResultsSection({
  myOrder,
  teamOrder,
  teamName,
}: ResultsSectionProps) {
  const mine = scoreRanking(myOrder)
  const team = scoreRanking(teamOrder)
  const delta = mine.total - team.total

  const verdict =
    delta > 0
      ? `The team beat you by ${delta} ${delta === 1 ? 'point' : 'points'}.`
      : delta < 0
        ? `You beat the team by ${-delta} ${delta === -1 ? 'point' : 'points'}.`
        : 'You and the team scored the same.'

  return (
    <section className="space-y-8" aria-labelledby="results-heading">
      <div className="space-y-4">
        <h2 id="results-heading" className="font-display text-2xl font-bold">
          Results
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ScoreCard label="You" total={mine.total} />
          <ScoreCard label={teamName || 'Team'} total={team.total} />
        </div>
        <p className="text-sm font-semibold">{verdict} Lower is better.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">NASA&apos;s ranking</h3>
        <ul
          aria-label="How far off each rank is"
          className="flex flex-wrap gap-1.5 text-xs font-semibold"
        >
          {[
            ['Exact', 0],
            ['1–2 off', 2],
            ['3–5 off', 5],
            ['6–8 off', 8],
            ['9+ off', 9],
          ].map(([text, diff]) => (
            <li
              key={text}
              className={cn(
                'rounded-full px-2 py-0.5',
                diffClasses(Number(diff)),
              )}
            >
              {text}
            </li>
          ))}
        </ul>

        <ul className="space-y-2 md:hidden">
          {ITEMS_BY_NASA_RANK.map((item) => (
            <li key={item.id} className="rounded-xl border bg-card p-3">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                  {item.nasaRank}
                </span>
                <ItemImage id={item.id} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug font-semibold">
                    {item.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                    <DiffChip
                      label="You"
                      rank={mine.perItem[item.id].rank}
                      diff={mine.perItem[item.id].diff}
                    />
                    <DiffChip
                      label="Team"
                      rank={team.perItem[item.id].rank}
                      diff={team.perItem[item.id].diff}
                    />
                  </div>
                  <details className="group mt-2 text-sm text-muted-foreground">
                    <summary className="flex min-h-8 cursor-pointer list-none items-center gap-1 font-medium text-primary [&::-webkit-details-marker]:hidden">
                      Why?
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="pb-1">{item.reasoning}</p>
                  </details>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2">NASA</th>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2 text-right">You</th>
                <th className="px-3 py-2 text-right">Δ</th>
                <th className="px-3 py-2 text-right">Team</th>
                <th className="px-3 py-2 text-right">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ITEMS_BY_NASA_RANK.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-3 py-2 font-bold tabular-nums">
                    {item.nasaRank}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-start gap-3">
                      <ItemImage id={item.id} className="size-9" />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.reasoning}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {mine.perItem[item.id].rank}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    <span
                      className={cn(
                        'inline-block min-w-8 rounded-full px-2 py-0.5 text-center',
                        diffClasses(mine.perItem[item.id].diff),
                      )}
                    >
                      {mine.perItem[item.id].diff}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {team.perItem[item.id].rank}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    <span
                      className={cn(
                        'inline-block min-w-8 rounded-full px-2 py-0.5 text-center',
                        diffClasses(team.perItem[item.id].diff),
                      )}
                    >
                      {team.perItem[item.id].diff}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/40 font-bold">
              <tr>
                <td className="px-3 py-2" colSpan={3}>
                  Total
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {mine.total}
                </td>
                <td />
                <td className="px-3 py-2 text-right tabular-nums">
                  {team.total}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Score bands</h3>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SCORE_BANDS.map((band) => (
            <li
              key={band.label}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <span
                className={cn(
                  'size-3 shrink-0 rounded-full',
                  TONE_BG[band.tone],
                )}
                aria-hidden="true"
              />
              <span className="font-semibold">{band.label}</span>
              <span className="ml-auto text-muted-foreground tabular-nums">
                {band.range}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Debrief</h3>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed marker:font-bold marker:text-primary">
          {DEBRIEF_QUESTIONS.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
        <p className="rounded-xl bg-accent p-4 text-sm leading-relaxed text-accent-foreground">
          <span className="font-bold">Key takeaway: </span>
          {TAKEAWAY}
        </p>
      </div>
    </section>
  )
}

/** Green for an exact match, shading to red the further off the rank is. */
function diffClasses(diff: number) {
  if (diff === 0) return 'bg-emerald-100 text-emerald-800'
  if (diff <= 2) return 'bg-lime-100 text-lime-800'
  if (diff <= 5) return 'bg-amber-100 text-amber-800'
  if (diff <= 8) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

function ScoreCard({ label, total }: { label: string; total: number }) {
  const band = getBand(total)
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="truncate text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-display text-4xl leading-none font-bold tabular-nums">
        {total}
      </p>
      <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
        <span
          className={cn('size-3 rounded-full', TONE_BG[band.tone])}
          aria-hidden="true"
        />
        {band.label}
      </p>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">
        {band.survival}
      </p>
    </div>
  )
}

function DiffChip({
  label,
  rank,
  diff,
}: {
  label: string
  rank: number
  diff: number
}) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 font-semibold tabular-nums',
        diffClasses(diff),
      )}
    >
      {label} #{rank} · {diff === 0 ? 'exact' : `off by ${diff}`}
    </span>
  )
}
