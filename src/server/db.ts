import { env } from 'cloudflare:workers'
import type { SessionEvent } from '#/server/events'
import type { SessionRoom } from '#/server/session-room'

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function newId() {
  return crypto.randomUUID()
}

export function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

export function parseOrder(value: string | null): string[] | null {
  return value ? (JSON.parse(value) as string[]) : null
}

export function roundTo1(value: number | null) {
  return value === null ? null : Math.round(value * 10) / 10
}

/** Tells the session's room something changed. Never fails the caller's write. */
export async function notify(sessionId: string, event: SessionEvent) {
  try {
    const stub = env.SESSION_ROOM.get(
      env.SESSION_ROOM.idFromName(sessionId),
    ) as unknown as DurableObjectStub<SessionRoom>
    await stub.broadcast(event)
  } catch (error) {
    console.error('broadcast failed', error)
  }
}

export interface SessionRow {
  id: string
  code: string
  name: string
  created_at: number
  closed_at: number | null
}

export interface TeamRow {
  id: string
  session_id: string
  name: string
  position: number
  team_order: string | null
  team_score: number | null
  locked_by: string | null
  locked_at: number | null
}

export interface ParticipantRow {
  id: string
  session_id: string
  team_id: string
  name: string
  my_order: string | null
  my_score: number | null
  my_locked_at: number | null
  joined_at: number
}

export function getSessionByCode(code: string) {
  return env.DB.prepare('SELECT * FROM sessions WHERE code = ?')
    .bind(code.trim().toUpperCase())
    .first<SessionRow>()
}

export function getSessionById(id: string) {
  return env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(id)
    .first<SessionRow>()
}

export async function getTeams(sessionId: string) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM teams WHERE session_id = ? ORDER BY position',
  )
    .bind(sessionId)
    .all<TeamRow>()
  return results
}

export function getParticipant(id: string) {
  return env.DB.prepare('SELECT * FROM participants WHERE id = ?')
    .bind(id)
    .first<ParticipantRow>()
}
