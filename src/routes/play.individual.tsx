import { createFileRoute } from '@tanstack/react-router'
import { IndividualRound } from '#/components/challenge/individual-round'
import { useOfflineChallenge } from '#/hooks/use-offline-challenge'

export const Route = createFileRoute('/play/individual')({
  head: () => ({ meta: [{ title: 'Solo ranking · Moon Survival' }] }),
  component: SoloIndividualPage,
})

function SoloIndividualPage() {
  const challenge = useOfflineChallenge()
  return <IndividualRound challenge={challenge} />
}
