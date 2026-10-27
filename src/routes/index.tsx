import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

const STEPS = [
  [
    'Read the scenario',
    'Your ship has crash-landed 200 miles from the mother ship.',
    '2 min',
  ],
  [
    'Rank alone',
    'Order the 15 surviving items from most to least important. No talking.',
    '3 min',
  ],
  [
    'Rank as a team',
    'Discuss and agree on one ranking. Reach real consensus: no voting, no averaging.',
    '3 min',
  ],
  [
    'See how you did',
    "Both rankings are scored against NASA's expert answers.",
  ],
]

function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-16">
      <img
        src="/hero.jpg"
        alt="A crash-landed rocket on the moon with a stranded astronaut saying, Mission Control, we have a wee problem!"
        width={1600}
        height={849}
        fetchPriority="high"
        className="h-auto w-full rounded-2xl border"
      />

      <header className="space-y-4">
        <h1 className="font-display text-4xl leading-tight font-bold sm:text-5xl">
          Moon Survival
        </h1>
        <p className="text-lg leading-relaxed text-foreground/85">
          You&apos;re part of a space crew that crash-landed on the moon, 200
          miles from the mother ship. Much of your equipment was destroyed, and
          only 15 items survived.
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          Your crew&apos;s survival depends on reaching the mother ship, so
          which items matter most? First you decide on your own. Then you make
          the call together, and find out whether the team beat its individuals.
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-lg font-bold">
          How it works
        </h2>
        <ol className="divide-y rounded-xl border bg-card">
          {STEPS.map(([title, detail, time], index) => (
            <li key={title} className="flex items-start gap-3 p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
              {time && (
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {time}
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <Button asChild size="lg" className="h-12 w-full text-base sm:w-fit">
        <Link to="/individual">
          Start the challenge <ArrowRight />
        </Link>
      </Button>
    </main>
  )
}
