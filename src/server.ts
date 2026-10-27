import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'
import { ADMIN_COOKIE, isAdminToken, readCookie } from '#/server/auth-core'

export { SessionRoom } from '#/server/session-room'

const WS_PATH = /^\/api\/sessions\/([^/]+)\/ws$/

/** Authenticates the socket, then hands it to the session's Durable Object. */
async function handleSocket(request: Request, sessionId: string) {
  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 426 })
  }

  const url = new URL(request.url)
  const participantId = url.searchParams.get('participantId')
  let tag: string | null = null

  if (participantId) {
    const row = await env.DB.prepare(
      'SELECT team_id FROM participants WHERE id = ? AND session_id = ?',
    )
      .bind(participantId, sessionId)
      .first<{ team_id: string }>()
    if (row) tag = `team:${row.team_id}`
  } else if (
    await isAdminToken(
      env,
      readCookie(request.headers.get('Cookie'), ADMIN_COOKIE),
    )
  ) {
    tag = 'admin'
  }
  if (!tag) return new Response('Unauthorized', { status: 401 })

  const stub = env.SESSION_ROOM.get(env.SESSION_ROOM.idFromName(sessionId))
  const target = new URL(request.url)
  target.search = `?tag=${encodeURIComponent(tag)}`
  return stub.fetch(new Request(target, request))
}

export default {
  fetch(request: Request, ...rest: Array<unknown>) {
    const match = WS_PATH.exec(new URL(request.url).pathname)
    if (match) return handleSocket(request, match[1])
    return (
      handler.fetch as (request: Request, ...rest: Array<unknown>) => unknown
    )(request, ...rest)
  },
}
