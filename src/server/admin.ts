import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import type {
  Dashboard,
  DashboardTeam,
  SessionSummary,
} from '#/lib/session-types'
import { requireAdmin } from '#/server/guard'
import {
  getSessionById,
  getTeams,
  newCode,
  newId,
  notify,
  roundTo1,
} from '#/server/db'
import type { ParticipantRow, TeamRow } from '#/server/db'

export const listSessions = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionSummary[]> => {
    await requireAdmin()
    const { results } = await env.DB.prepare(
      `SELECT s.id, s.code, s.name, s.created_at, s.closed_at,
        (SELECT COUNT(*) FROM teams t WHERE t.session_id = s.id) AS teams,
        (SELECT COUNT(*) FROM participants p WHERE p.session_id = s.id) AS joined,
        (SELECT COUNT(*) FROM participants p
           JOIN teams t ON t.id = p.team_id
          WHERE p.session_id = s.id AND p.my_locked_at IS NOT NULL
            AND t.locked_at IS NOT NULL) AS finished,
        (SELECT AVG(p.my_score) FROM participants p
           JOIN teams t ON t.id = p.team_id
          WHERE p.session_id = s.id AND p.my_locked_at IS NOT NULL
            AND t.locked_at IS NOT NULL) AS avg_individual,
        (SELECT AVG(t.team_score) FROM teams t
          WHERE t.session_id = s.id AND t.locked_at IS NOT NULL) AS avg_team
       FROM sessions s ORDER BY s.created_at DESC`,
    ).all<{
      id: string
      code: string
      name: string
      created_at: number
      closed_at: number | null
      teams: number
      joined: number
      finished: number
      avg_individual: number | null
      avg_team: number | null
    }>()
    return results.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      closed: row.closed_at !== null,
      createdAt: row.created_at,
      teams: row.teams,
      joined: row.joined,
      finished: row.finished,
      avgIndividual: roundTo1(row.avg_individual),
      avgTeam: roundTo1(row.avg_team),
    }))
  },
)

function cleanTeamNames(names: string[]) {
  return names.map((name) => name.trim()).filter(Boolean)
}

export const createSession = createServerFn({ method: 'POST' })
  .validator((data: { name: string; teams: string[] }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    const name = data.name.trim()
    const teams = cleanTeamNames(data.teams)
    if (!name) throw new Error('Session name is required')
    if (teams.length === 0) throw new Error('Add at least one team')

    const id = newId()
    // A random 6-char code collides rarely; retry in case it does.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = newCode()
      try {
        await env.DB.batch([
          env.DB.prepare(
            'INSERT INTO sessions (id, code, name, created_at) VALUES (?, ?, ?, ?)',
          ).bind(id, code, name, Date.now()),
          ...teams.map((teamName, position) =>
            env.DB.prepare(
              'INSERT INTO teams (id, session_id, name, position) VALUES (?, ?, ?, ?)',
            ).bind(newId(), id, teamName, position),
          ),
        ])
        return { id, code }
      } catch (error) {
        if (!String(error).includes('UNIQUE')) throw error
      }
    }
    throw new Error('Could not generate a session code, try again')
  })

export const addTeam = createServerFn({ method: 'POST' })
  .validator((data: { sessionId: string; name: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    const name = data.name.trim()
    if (!name) throw new Error('Team name is required')
    const teams = await getTeams(data.sessionId)
    await env.DB.prepare(
      'INSERT INTO teams (id, session_id, name, position) VALUES (?, ?, ?, ?)',
    )
      .bind(newId(), data.sessionId, name, teams.length)
      .run()
    await notify(data.sessionId, { type: 'session-changed' })
  })

export const setSessionClosed = createServerFn({ method: 'POST' })
  .validator((data: { sessionId: string; closed: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    await env.DB.prepare('UPDATE sessions SET closed_at = ? WHERE id = ?')
      .bind(data.closed ? Date.now() : null, data.sessionId)
      .run()
    await notify(data.sessionId, { type: 'session-changed' })
  })

function average(values: number[]) {
  return values.length === 0
    ? null
    : roundTo1(values.reduce((sum, v) => sum + v, 0) / values.length)
}

export const getSessionDashboard = createServerFn({ method: 'GET' })
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ data }): Promise<Dashboard | null> => {
    await requireAdmin()
    const session = await getSessionById(data.sessionId)
    if (!session) return null

    const teamRows: TeamRow[] = await getTeams(session.id)
    const { results: people } = await env.DB.prepare(
      'SELECT * FROM participants WHERE session_id = ? ORDER BY my_score, joined_at',
    )
      .bind(session.id)
      .all<ParticipantRow>()

    // Final scores only: a person shows up once they and their team are locked.
    const teams: DashboardTeam[] = teamRows.map((team) => {
      const mine = people.filter((p) => p.team_id === team.id)
      const teamLocked = team.locked_at !== null
      return {
        id: team.id,
        name: team.name,
        joined: mine.length,
        teamScore: teamLocked ? team.team_score : null,
        lockedBy: team.locked_by
          ? (people.find((p) => p.id === team.locked_by)?.name ?? null)
          : null,
        members: teamLocked
          ? mine
              .filter((p) => p.my_locked_at !== null && p.my_score !== null)
              .map((p) => ({ id: p.id, name: p.name, score: p.my_score! }))
          : [],
      }
    })

    const finishedMembers = teams.flatMap((t) =>
      t.members.map((m) => ({ ...m, teamScore: t.teamScore! })),
    )
    return {
      id: session.id,
      code: session.code,
      name: session.name,
      closed: session.closed_at !== null,
      createdAt: session.created_at,
      joined: people.length,
      finished: finishedMembers.length,
      avgIndividual: average(finishedMembers.map((m) => m.score)),
      avgTeam: average(
        teams.flatMap((t) => (t.teamScore === null ? [] : [t.teamScore])),
      ),
      teamBeatCount: finishedMembers.filter((m) => m.teamScore < m.score)
        .length,
      teams,
    }
  })
