import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { ActionBar } from '#/components/challenge/action-bar'
import { ConfirmLockDialog } from '#/components/challenge/confirm-lock-dialog'
import { RankingList } from '#/components/challenge/ranking-list'
import { RoundNav } from '#/components/challenge/round-nav'
import { Scenario } from '#/components/challenge/scenario'
import { Button } from '#/components/ui/button'
import { useChallenge } from '#/hooks/use-challenge'

export const Route = createFileRoute('/individual')({
  head: () => ({
    meta: [{ title: 'Individual ranking · Moon Survival' }],
  }),
  component: IndividualPage,
})

function IndividualPage() {
  const challenge = useChallenge()
  const { hydrated, myLocked, teamLocked } = challenge

  return (
    <div className="min-h-dvh pb-28">
      <RoundNav
        current="individual"
        myLocked={myLocked}
        teamLocked={teamLocked}
      />
      <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
        {!hydrated ? (
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        ) : (
          <>
            <Scenario
              name={challenge.name}
              onProfileChange={challenge.setProfile}
              disabled={teamLocked}
            />

            {myLocked && (
              <div className="flex items-start gap-3 rounded-xl border border-band-excellent/40 bg-band-excellent/10 p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-band-excellent" />
                <div className="space-y-1 text-sm">
                  <p className="font-bold">Your ranking is saved</p>
                  <p className="text-muted-foreground">
                    Now discuss with your team and agree on one ranking.
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
            </section>
          </>
        )}
      </main>

      {hydrated && (
        <ActionBar>
          {myLocked ? (
            <>
              <Button
                variant="outline"
                className="h-11"
                disabled={teamLocked}
                onClick={challenge.unlockMine}
              >
                Edit
              </Button>
              <Button asChild className="h-11 flex-1">
                <Link to="/team">
                  Go to team round <ArrowRight />
                </Link>
              </Button>
            </>
          ) : (
            <ConfirmLockDialog
              title="Lock in your ranking?"
              description="You can still edit it until the team round is locked."
              confirmLabel="Lock in"
              onConfirm={challenge.lockMine}
              trigger={
                <Button
                  className="h-11 flex-1"
                  disabled={!challenge.name.trim()}
                >
                  <Lock />
                  {challenge.name.trim()
                    ? 'Lock in ranking'
                    : 'Enter your name to lock in'}
                </Button>
              }
            />
          )}
        </ActionBar>
      )}
    </div>
  )
}
