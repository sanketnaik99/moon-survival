import { Link } from '@tanstack/react-router'
import { ArrowLeft, Lock, RotateCcw, Users } from 'lucide-react'
import { ActionBar } from '#/components/challenge/action-bar'
import { ConfirmLockDialog } from '#/components/challenge/confirm-lock-dialog'
import { RankingList } from '#/components/challenge/ranking-list'
import { ResultsSection } from '#/components/challenge/results-section'
import { RoundNav } from '#/components/challenge/round-nav'
import { Button } from '#/components/ui/button'
import type { ChallengeView } from '#/lib/challenge-types'

interface TeamRoundProps {
  challenge: ChallengeView
  /** Session code; omit for solo play. */
  code?: string
  /** Solo play only: clears both rankings on this device. */
  onPlayAgain?: () => void
}

export function TeamRound({ challenge, code, onPlayAgain }: TeamRoundProps) {
  const { hydrated, joined, myLocked, teamLocked } = challenge

  return (
    <div className="min-h-dvh pb-28">
      <RoundNav
        code={code}
        current="team"
        myLocked={myLocked}
        teamLocked={teamLocked}
      />
      <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
        {!hydrated ? (
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        ) : !joined || !myLocked ? (
          <div className="space-y-3 rounded-xl border bg-card p-5">
            <h1 className="font-display text-2xl font-bold">
              Do your own ranking first
            </h1>
            <p className="text-sm text-muted-foreground">
              Everyone ranks the items alone before the team round starts.
            </p>
            <Button asChild className="h-11">
              {joined || !code ? (
                code ? (
                  <Link to="/s/$code/individual" params={{ code }}>
                    Go to individual round
                  </Link>
                ) : (
                  <Link to="/play/individual">Go to individual round</Link>
                )
              ) : (
                <Link to="/s/$code" params={{ code }}>
                  Join session
                </Link>
              )}
            </Button>
          </div>
        ) : (
          <>
            <section className="mx-auto w-full max-w-lg space-y-4">
              <div className="space-y-1 text-center">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                  <Users className="size-4" aria-hidden="true" />
                  {code ? challenge.teamName : 'Your group'}
                </p>
                <h1 className="font-display text-3xl font-bold">
                  {code ? 'Team ranking' : 'Group ranking'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {teamLocked
                    ? `Locked in${challenge.teamLockedBy ? ` by ${challenge.teamLockedBy}` : ''}.`
                    : code
                      ? "Discuss and agree on one order. Reach real consensus: don't vote or average. Everyone starts from the original order. Whoever locks first submits for the whole team."
                      : "Playing with others on this device? Discuss and agree on one order. Reach real consensus: don't vote or average. Everyone starts from the original order."}
                </p>
              </div>
              <RankingList
                order={challenge.teamOrder}
                onChange={challenge.setTeamOrder}
                label="Team ranking"
                disabled={teamLocked}
              />
              {challenge.error && (
                <p className="text-sm text-destructive">{challenge.error}</p>
              )}
            </section>

            {teamLocked && (
              <ResultsSection
                myOrder={challenge.myOrder}
                teamOrder={challenge.teamOrder}
                teamName={challenge.teamName}
              />
            )}
          </>
        )}
      </main>

      {hydrated && joined && myLocked && !teamLocked && (
        <ActionBar>
          <Button asChild variant="outline" className="h-11">
            {code ? (
              <Link to="/s/$code/individual" params={{ code }}>
                <ArrowLeft /> Mine
              </Link>
            ) : (
              <Link to="/play/individual">
                <ArrowLeft /> Mine
              </Link>
            )}
          </Button>
          <ConfirmLockDialog
            title="Lock in the team ranking?"
            description="This reveals NASA's answers and scores for your whole team, and you can't change it afterward."
            confirmLabel="Lock in and reveal"
            requireAck="Everyone agreed (no voting or averaging)"
            onConfirm={() => void challenge.lockTeam()}
            trigger={
              <Button className="h-11 flex-1" disabled={challenge.pending}>
                <Lock />
                Lock in team ranking
              </Button>
            }
          />
        </ActionBar>
      )}

      {hydrated && !code && teamLocked && onPlayAgain && (
        <ActionBar>
          <ConfirmLockDialog
            title="Start over?"
            description="This clears both rankings on this device."
            confirmLabel="Start over"
            cancelLabel="Keep results"
            onConfirm={onPlayAgain}
            trigger={
              <Button variant="outline" className="h-11 flex-1">
                <RotateCcw />
                Play again
              </Button>
            }
          />
        </ActionBar>
      )}
    </div>
  )
}
