import { useEffect, useRef } from 'react'

const PING_MS = 25_000
const MAX_BACKOFF_MS = 15_000

/**
 * Keeps a WebSocket open to the session room and calls `onChange` whenever
 * something may have changed: on every message, and after each reconnect so
 * events missed while offline are picked up. Pass `participantId` for a
 * participant, omit it for the admin (cookie auth).
 */
export function useSessionSocket(
  sessionId: string | null,
  participantId: string | null | undefined,
  onChange: () => void,
) {
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    if (!sessionId) return
    let socket: WebSocket | null = null
    let ping: ReturnType<typeof setInterval> | undefined
    let retry: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    let opened = false
    let disposed = false

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const query = participantId
        ? `?participantId=${encodeURIComponent(participantId)}`
        : ''
      socket = new WebSocket(
        `${protocol}://${window.location.host}/api/sessions/${sessionId}/ws${query}`,
      )
      socket.onopen = () => {
        attempts = 0
        if (opened) onChangeRef.current()
        opened = true
        ping = setInterval(() => socket?.send('ping'), PING_MS)
      }
      socket.onmessage = (event) => {
        if (event.data !== 'pong') onChangeRef.current()
      }
      socket.onclose = () => {
        clearInterval(ping)
        if (disposed) return
        attempts += 1
        retry = setTimeout(
          connect,
          Math.min(MAX_BACKOFF_MS, 500 * 2 ** attempts),
        )
      }
    }
    connect()

    return () => {
      disposed = true
      clearInterval(ping)
      clearTimeout(retry)
      socket?.close()
    }
  }, [sessionId, participantId])
}
