import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { ActionBar } from '#/components/challenge/action-bar'
import { ConfirmLockDialog } from '#/components/challenge/confirm-lock-dialog'
import { RankingList } from '#/components/challenge/ranking-list'
import { RoundNav } from '#/components/challenge/round-nav'
import { Scenario } from '#/components/challenge/scenario'
import { Button } from '#/components/ui/button'
import { useSessionChallenge } from '#/hooks/use-session-challenge'

export const Route = createFileRoute('/s/$code/individual')({
  head: () => ({
    meta: [{ title: 'Individual ranking · Moon Survival' }],
  }),
  component: IndividualPage,
})

function IndividualPage() {
  const { code } = Route.useParams()
  const challenge = useSessionChallenge(code)
  const { hydrated, joined, myLocked, teamLocked } = challenge

  return (
    <div className="min-h-dvh pb-28">
      <RoundNav
        code={code}
        current="individual"
        myLocked={myLocked}
        teamLocked={teamLocked}
      />
      <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
        {!hydrated ? (
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        ) : !joined ? (
          <NotJoined code={code} />
        ) : (
          <>
            <Scenario />

            {myLocked && (
              <div className="flex items-start gap-3 rounded-xl border border-band-excellent/40 bg-band-excellent/10 p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-band-excellent" />
                <div className="space-y-1 text-sm">
                  <p className="font-bold">Your ranking is saved</p>
                  <p className="text-muted-foreground">
                    Now discuss with your team ({challenge.teamName}) and agree
                    on one ranking.
                  </p>
                </div>
              </div>
            )}

            <section className="mx-auto w-full max-w-lg space-y-3">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Your ranking
                </h2>
                <p className="text-sm text-muted-foreground">
                  Drag the handle on the right, or focus it and use the arrow
                  keys. No talking!
                </p>
              </div>
              <RankingList
                order={challenge.myOrder}
                onChange={challenge.setMyOrder}
                label="Your ranking"
                disabled={myLocked}
              />
              {challenge.error && (
                <p className="text-sm text-destructive">{challenge.error}</p>
              )}
            </section>
          </>
        )}
      </main>

      {hydrated && joined && (
        <ActionBar>
          {myLocked ? (
            <>
              <Button asChild className="h-11 flex-1">
                <Link to="/s/$code/team" params={{ code }}>
                  Go to team round <ArrowRight />
                </Link>
              </Button>
            </>
          ) : (
            <ConfirmLockDialog
              title="Lock in your ranking?"
              description="This is your own baseline score, so you can't change it afterward."
              confirmLabel="Lock in"
              onConfirm={() => void challenge.lockMine()}
              trigger={
                <Button className="h-11 flex-1" disabled={challenge.pending}>
                  <Lock />
                  Lock in ranking
                </Button>
              }
            />
          )}
        </ActionBar>
      )}
    </div>
  )
}

function NotJoined({ code }: { code: string }) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-5">
      <h1 className="font-display text-2xl font-bold">
        Join the session first
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter your name and pick your team to get started.
      </p>
      <Button asChild className="h-11">
        <Link to="/s/$code" params={{ code }}>
          Join session
        </Link>
      </Button>
    </div>
  )
}
