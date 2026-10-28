/** What the round screens need, whether state comes from a session or the device. */
export interface ChallengeView {
  hydrated: boolean
  joined: boolean
  pending: boolean
  error: string | null
  teamName: string
  teamLockedBy: string | null
  myLocked: boolean
  teamLocked: boolean
  myOrder: string[]
  teamOrder: string[]
  setMyOrder: (order: string[]) => void
  setTeamOrder: (order: string[]) => void
  lockMine: () => void | Promise<void>
  lockTeam: () => void | Promise<void>
}
