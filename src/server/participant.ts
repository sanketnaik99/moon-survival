import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { isValidOrder, scoreRanking } from '#/lib/nasa'
import type { ParticipantState, PublicSession } from '#/lib/session-types'
import {
  getParticipant,
  getSessionByCode,
  getSessionById,
  getTeams,
  newId,
  notify,
  parseOrder,
} from '#/server/db'

export const getSessionPublic = createServerFn({ method: 'GET' })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }): Promise<PublicSession | null> => {
    const session = await getSessionByCode(data.code)
    if (!session) return null
    const teams = await getTeams(session.id)
    return {
      id: session.id,
      code: session.code,
      name: session.name,
      closed: session.closed_at !== null,
      teams: teams.map((t) => ({ id: t.id, name: t.name })),
    }
  })

async function loadState(
  participantId: string,
): Promise<ParticipantState | null> {
  const person = await getParticipant(participantId)
  if (!person) return null
  const [session, team] = await Promise.all([
    getSessionById(person.session_id),
    env.DB.prepare('SELECT * FROM teams WHERE id = ?')
      .bind(person.team_id)
      .first<{
        name: string
        team_order: string | null
        locked_at: number | null
        locked_by: string | null
      }>(),
  ])
  if (!session || !team) return null
  const lockedBy = team.locked_by ? await getParticipant(team.locked_by) : null
  return {
    participantId: person.id,
    sessionId: session.id,
    sessionName: session.name,
    sessionClosed: session.closed_at !== null,
    name: person.name,
    teamId: person.team_id,
    teamName: team.name,
    myOrder: parseOrder(person.my_order),
    myLocked: person.my_locked_at !== null,
    teamOrder: parseOrder(team.team_order),
    teamLocked: team.locked_at !== null,
    teamLockedBy: lockedBy?.name ?? null,
  }
}

export const getParticipantState = createServerFn({ method: 'GET' })
  .validator((data: { participantId: string }) => data)
  .handler(({ data }) => loadState(data.participantId))

export const joinSession = createServerFn({ method: 'POST' })
  .validator((data: { code: string; name: string; teamId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSessionByCode(data.code)
    if (!session) throw new Error('Session not found')
    if (session.closed_at !== null) throw new Error('This session is closed')
    const name = data.name.trim().slice(0, 60)
    if (!name) throw new Error('Enter your name')
    const teams = await getTeams(session.id)
    if (!teams.some((t) => t.id === data.teamId)) {
      throw new Error('Pick a team')
    }

    const participantId = newId()
    await env.DB.prepare(
      'INSERT INTO participants (id, session_id, team_id, name, joined_at) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(participantId, session.id, data.teamId, name, Date.now())
      .run()
    await notify(session.id, {
      type: 'participant-joined',
      teamId: data.teamId,
    })
    return { participantId }
  })

async function requireOpenParticipant(participantId: string) {
  const person = await getParticipant(participantId)
  if (!person) throw new Error('Participant not found')
  const session = await getSessionById(person.session_id)
  if (!session || session.closed_at !== null) {
    throw new Error('This session is closed')
  }
  return person
}

export const lockIndividual = createServerFn({ method: 'POST' })
  .validator((data: { participantId: string; order: string[] }) => data)
  .handler(async ({ data }) => {
    const person = await requireOpenParticipant(data.participantId)
    if (!isValidOrder(data.order)) throw new Error('Invalid ranking')

    // Scores are only ever computed here, never trusted from the client.
    const { total } = scoreRanking(data.order)
    // Final: only the first lock counts, so a repeat or replayed call changes nothing.
    const result = await env.DB.prepare(
      `UPDATE participants SET my_order = ?, my_score = ?, my_locked_at = ?
        WHERE id = ? AND my_locked_at IS NULL`,
    )
      .bind(JSON.stringify(data.order), total, Date.now(), person.id)
      .run()
    if (result.meta.changes > 0) {
      await notify(person.session_id, {
        type: 'individual-locked',
        teamId: person.team_id,
      })
    }
    return loadState(person.id)
  })

export const lockTeam = createServerFn({ method: 'POST' })
  .validator((data: { participantId: string; order: string[] }) => data)
  .handler(async ({ data }) => {
    const person = await requireOpenParticipant(data.participantId)
    if (person.my_locked_at === null) {
      throw new Error('Lock in your own ranking first')
    }
    if (!isValidOrder(data.order)) throw new Error('Invalid ranking')

    // Atomic: the first teammate to get here wins, everyone else sees their lock.
    const result = await env.DB.prepare(
      `UPDATE teams SET team_order = ?, team_score = ?, locked_by = ?, locked_at = ?
        WHERE id = ? AND locked_at IS NULL`,
    )
      .bind(
        JSON.stringify(data.order),
        scoreRanking(data.order).total,
        person.id,
        Date.now(),
        person.team_id,
      )
      .run()
    if (result.meta.changes > 0) {
      await notify(person.session_id, {
        type: 'team-locked',
        teamId: person.team_id,
      })
    }
    return loadState(person.id)
  })
