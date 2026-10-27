import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { LogOut, Rocket } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { isAdmin, logout } from '#/server/auth'

export const Route = createFileRoute('/admin/_authed')({
  beforeLoad: async () => {
    if (!(await isAdmin())) throw redirect({ to: '/admin/login' })
  },
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh pb-12">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-2 px-4">
          <Link
            to="/admin"
            className="flex items-center gap-2 font-display text-base font-bold text-primary"
          >
            <Rocket className="size-4" aria-hidden="true" />
            Moon Survival · Admin
          </Link>
          <Button
            variant="ghost"
            className="h-11"
            onClick={async () => {
              await logout()
              await navigate({ to: '/admin/login' })
            }}
          >
            <LogOut /> Log out
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
