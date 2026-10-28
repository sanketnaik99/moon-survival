import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { TeamRound } from '#/components/challenge/team-round'
import { useOfflineChallenge } from '#/hooks/use-offline-challenge'

export const Route = createFileRoute('/play/team')({
  head: () => ({ meta: [{ title: 'Group ranking · Moon Survival' }] }),
  component: SoloTeamPage,
})

function SoloTeamPage() {
  const navigate = useNavigate()
  const challenge = useOfflineChallenge()
  return (
    <TeamRound
      challenge={challenge}
      onPlayAgain={() => {
        challenge.reset()
        void navigate({ to: '/play/individual' })
      }}
    />
  )
}
