import { Input } from '#/components/ui/input'
import { SCENARIO } from '#/lib/nasa'

interface ScenarioProps {
  name: string
  onProfileChange: (profile: { name: string }) => void
  disabled?: boolean
}

const STEPS = [
  ['Rank alone', 'About 3 minutes, no talking'],
  ['Rank as a team', 'Reach real consensus, no voting'],
  ['Compare with NASA', 'See how you and your team scored'],
]

export function Scenario({ name, onProfileChange, disabled }: ScenarioProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Team exercise
        </p>
        <h1 className="font-display text-3xl leading-tight font-bold sm:text-4xl">
          Moon Survival
        </h1>
        {SCENARIO.map((paragraph) => (
          <p
            key={paragraph}
            className="text-base leading-relaxed text-foreground/85"
          >
            {paragraph}
          </p>
        ))}
        <p className="text-base leading-relaxed font-semibold">
          Rank the items from 1 (most important) to 15 (least important) for the
          200-mile trip.
        </p>
      </div>

      <ol className="space-y-2 rounded-xl border bg-card p-4">
        {STEPS.map(([title, detail], index) => (
          <li key={title} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {index + 1}
            </span>
            <span className="text-sm">
              <span className="font-semibold">{title}</span>
              <span className="text-muted-foreground"> · {detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <label className="grid gap-1.5 text-sm font-semibold">
        Your name
        <Input
          value={name}
          disabled={disabled}
          autoComplete="name"
          required
          placeholder="e.g. Alex"
          className="h-11"
          onChange={(event) => onProfileChange({ name: event.target.value })}
        />
      </label>
    </section>
  )
}
