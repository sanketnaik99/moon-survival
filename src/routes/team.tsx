import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Lock } from 'lucide-react'
import { ActionBar } from '#/components/challenge/action-bar'
import { ConfirmLockDialog } from '#/components/challenge/confirm-lock-dialog'
import { RankingList } from '#/components/challenge/ranking-list'
import { ResultsSection } from '#/components/challenge/results-section'
import { RoundNav } from '#/components/challenge/round-nav'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useChallenge } from '#/hooks/use-challenge'

export const Route = createFileRoute('/team')({
  head: () => ({ meta: [{ title: 'Team ranking · Moon Survival' }] }),
  component: TeamPage,
})

function TeamPage() {
  const challenge = useChallenge()
  const navigate = useNavigate()
  const { hydrated, myLocked, teamLocked } = challenge
  const teamOrder = challenge.teamOrder ?? challenge.myOrder

  return (
    <div className="min-h-dvh pb-28">
      <RoundNav current="team" myLocked={myLocked} teamLocked={teamLocked} />
      <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
        {!hydrated ? (
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        ) : !myLocked ? (
          <div className="space-y-3 rounded-xl border bg-card p-5">
            <h1 className="font-display text-2xl font-bold">
              Do your own ranking first
            </h1>
            <p className="text-sm text-muted-foreground">
              Everyone ranks the items alone before the team round starts.
            </p>
            <Button asChild className="h-11">
              <Link to="/individual">Go to individual round</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="mx-auto w-full max-w-lg space-y-4">
              <div className="text-center">
                <h1 className="font-display text-3xl font-bold">
                  Team ranking
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Discuss and agree on one order. Reach real consensus:
                  don&apos;t vote or average. We started from your own order.
                </p>
              </div>
              <label className="grid gap-1.5 text-center text-sm font-semibold">
                Team name
                <Input
                  value={challenge.team}
                  disabled={teamLocked}
                  placeholder="e.g. Mission Control"
                  autoComplete="off"
                  className="h-11 text-center"
                  onChange={(event) =>
                    challenge.setProfile({ team: event.target.value })
                  }
                />
              </label>
              <RankingList
                order={teamOrder}
                onChange={challenge.setTeamOrder}
                label="Team ranking"
                disabled={teamLocked}
              />
            </section>

            {teamLocked && (
              <ResultsSection
                myOrder={challenge.myOrder}
                teamOrder={teamOrder}
                teamName={challenge.team.trim()}
              />
            )}
          </>
        )}
      </main>

      {hydrated && myLocked && (
        <ActionBar>
          {teamLocked ? (
            <ConfirmLockDialog
              title="Start over?"
              description="This clears both rankings on this device."
              confirmLabel="Start over"
              cancelLabel="Cancel"
              onConfirm={() => {
                challenge.reset()
                void navigate({ to: '/individual' })
              }}
              trigger={
                <Button variant="outline" className="h-11 flex-1">
                  Start over
                </Button>
              }
            />
          ) : (
            <>
              <Button asChild variant="outline" className="h-11">
                <Link to="/individual">
                  <ArrowLeft /> Mine
                </Link>
              </Button>
              <ConfirmLockDialog
                title="Lock in the team ranking?"
                description="This reveals NASA's answers and scores, and you can't change it afterward."
                confirmLabel="Lock in and reveal"
                requireAck="Everyone agreed (no voting or averaging)"
                onConfirm={challenge.lockTeam}
                trigger={
                  <Button
                    className="h-11 flex-1"
                    disabled={!challenge.team.trim()}
                  >
                    <Lock />
                    {challenge.team.trim()
                      ? 'Lock in team ranking'
                      : 'Enter a team name to lock in'}
                  </Button>
                }
              />
            </>
          )}
        </ActionBar>
      )}
    </div>
  )
}
