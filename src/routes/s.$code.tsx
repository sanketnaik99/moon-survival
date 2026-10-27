import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { getSessionPublic } from '#/server/participant'

export const Route = createFileRoute('/s/$code')({
  loader: ({ params }) => getSessionPublic({ data: { code: params.code } }),
  head: () => ({ meta: [{ title: 'Moon Survival' }] }),
  component: SessionLayout,
})

function SessionLayout() {
  const session = Route.useLoaderData()

  if (!session) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-3 px-4 py-10">
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <h1 className="font-display text-2xl font-bold">Session not found</h1>
          <p className="text-sm text-muted-foreground">
            Check the code or ask your facilitator for a fresh link.
          </p>
          <Button asChild className="h-11">
            <Link to="/">Back to start</Link>
          </Button>
        </div>
      </main>
    )
  }

  return <Outlet />
}
