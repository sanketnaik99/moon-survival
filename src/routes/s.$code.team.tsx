import { createFileRoute } from '@tanstack/react-router'
import { TeamRound } from '#/components/challenge/team-round'
import { useSessionChallenge } from '#/hooks/use-session-challenge'

export const Route = createFileRoute('/s/$code/team')({
  head: () => ({ meta: [{ title: 'Team ranking · Moon Survival' }] }),
  component: TeamPage,
})

function TeamPage() {
  const { code } = Route.useParams()
  const challenge = useSessionChallenge(code)
  return <TeamRound challenge={challenge} code={code} />
}
