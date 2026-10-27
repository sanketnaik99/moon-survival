const SALT = 'moon-survival-admin-v1'

export const ADMIN_COOKIE = 'admin'

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function adminToken(password: string) {
  return sha256Hex(`${password}:${SALT}`)
}

export async function isAdminToken(env: Env, token: string | undefined) {
  if (!token || !env.ADMIN_PASSWORD) return false
  return token === (await adminToken(env.ADMIN_PASSWORD))
}

export function readCookie(header: string | null, name: string) {
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return undefined
}
