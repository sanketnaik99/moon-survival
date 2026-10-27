import { DurableObject } from 'cloudflare:workers'
import type { SessionEvent } from '#/server/events'

/**
 * One room per session. D1 is the source of truth; this only fans out
 * "something changed" events so clients know when to refetch.
 * Sockets are tagged `admin` or `team:<teamId>`.
 */
export class SessionRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('ping', 'pong'),
    )
  }

  fetch(request: Request): Response {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 426 })
    }
    const tag = new URL(request.url).searchParams.get('tag')
    if (!tag) return new Response('Missing tag', { status: 400 })

    const pair = new WebSocketPair()
    this.ctx.acceptWebSocket(pair[1], [tag])
    return new Response(null, { status: 101, webSocket: pair[0] })
  }

  broadcast(event: SessionEvent) {
    const message = JSON.stringify(event)
    const targets = new Set(this.ctx.getWebSockets('admin'))
    if ('teamId' in event) {
      for (const ws of this.ctx.getWebSockets(`team:${event.teamId}`)) {
        targets.add(ws)
      }
    }
    for (const ws of targets) {
      try {
        ws.send(message)
      } catch {
        // Socket already closing; the client will reconnect and refetch.
      }
    }
  }

  webSocketMessage() {
    // Clients never send anything meaningful; pings are auto-answered.
  }

  webSocketClose(ws: WebSocket, code: number) {
    ws.close(code)
  }
}
