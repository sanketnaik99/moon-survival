import { createFileRoute } from '@tanstack/react-router'
import { IndividualRound } from '#/components/challenge/individual-round'
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
  return <IndividualRound challenge={challenge} code={code} />
}
