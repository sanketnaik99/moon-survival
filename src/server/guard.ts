import { getCookie } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { ADMIN_COOKIE, isAdminToken } from '#/server/auth-core'

/** Only call from inside a server function handler. */
export async function requireAdmin() {
  if (!(await isAdminToken(env, getCookie(ADMIN_COOKIE)))) {
    throw new Error('Unauthorized')
  }
}
