import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { isAdmin, login } from '#/server/auth'

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
    if (await isAdmin()) throw redirect({ to: '/admin' })
  },
  head: () => ({ meta: [{ title: 'Admin login · Moon Survival' }] }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <form
        className="space-y-4 rounded-xl border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault()
          setPending(true)
          setError(false)
          const result = await login({ data: { password } })
          if (result.ok) {
            await navigate({ to: '/admin' })
          } else {
            setError(true)
            setPending(false)
          }
        }}
      >
        <h1 className="font-display text-2xl font-bold">Admin</h1>
        <label className="grid gap-1.5 text-sm font-semibold">
          Password
          <Input
            type="password"
            value={password}
            autoComplete="current-password"
            autoFocus
            className="h-11"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="text-sm text-destructive">Wrong password.</p>}
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={!password || pending}
        >
          Sign in
        </Button>
      </form>
    </main>
  )
}
