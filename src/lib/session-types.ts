export interface PublicSession {
  id: string
  code: string
  name: string
  closed: boolean
  teams: Array<{ id: string; name: string }>
}

export interface ParticipantState {
  participantId: string
  sessionId: string
  sessionName: string
  sessionClosed: boolean
  name: string
  teamId: string
  teamName: string
  myOrder: string[] | null
  myLocked: boolean
  teamOrder: string[] | null
  teamLocked: boolean
  teamLockedBy: string | null
}

export interface DashboardMember {
  id: string
  name: string
  score: number
}

export interface DashboardTeam {
  id: string
  name: string
  joined: number
  teamScore: number | null
  lockedBy: string | null
  members: DashboardMember[]
}

export interface Dashboard {
  id: string
  code: string
  name: string
  closed: boolean
  createdAt: number
  joined: number
  finished: number
  avgIndividual: number | null
  avgTeam: number | null
  teamBeatCount: number
  teams: DashboardTeam[]
}

export interface SessionSummary {
  id: string
  code: string
  name: string
  closed: boolean
  createdAt: number
  teams: number
  joined: number
  finished: number
  avgIndividual: number | null
  avgTeam: number | null
}
