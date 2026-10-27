import { createServerFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { ADMIN_COOKIE, adminToken, isAdminToken } from '#/server/auth-core'

const THIRTY_DAYS = 60 * 60 * 24 * 30

export const isAdmin = createServerFn({ method: 'GET' }).handler(() =>
  isAdminToken(env, getCookie(ADMIN_COOKIE)),
)

export const login = createServerFn({ method: 'POST' })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    if (!env.ADMIN_PASSWORD || data.password !== env.ADMIN_PASSWORD) {
      return { ok: false as const }
    }
    setCookie(ADMIN_COOKIE, await adminToken(env.ADMIN_PASSWORD), {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: THIRTY_DAYS,
    })
    return { ok: true as const }
  })

export const logout = createServerFn({ method: 'POST' }).handler(() => {
  deleteCookie(ADMIN_COOKIE, { path: '/' })
})
