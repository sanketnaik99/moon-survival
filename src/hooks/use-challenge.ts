import { useCallback, useEffect, useState } from 'react'
import { INITIAL_ORDER } from '#/lib/nasa'

const STORAGE_KEY = 'nasa-survival:v1'

export interface ChallengeState {
  name: string
  team: string
  myOrder: string[]
  myLocked: boolean
  teamOrder: string[] | null
  teamLocked: boolean
}

const DEFAULT_STATE: ChallengeState = {
  name: '',
  team: '',
  myOrder: INITIAL_ORDER,
  myLocked: false,
  teamOrder: null,
  teamLocked: false,
}

function isValidOrder(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length === INITIAL_ORDER.length &&
    INITIAL_ORDER.every((id) => value.includes(id))
  )
}

function load(): ChallengeState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<ChallengeState>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      team: typeof parsed.team === 'string' ? parsed.team : '',
      myOrder: isValidOrder(parsed.myOrder) ? parsed.myOrder : INITIAL_ORDER,
      myLocked: parsed.myLocked === true && isValidOrder(parsed.myOrder),
      teamOrder: isValidOrder(parsed.teamOrder) ? parsed.teamOrder : null,
      teamLocked: parsed.teamLocked === true && isValidOrder(parsed.teamOrder),
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function useChallenge() {
  const [state, setState] = useState<ChallengeState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(load())
    setHydrated(true)
  }, [])

  const update = useCallback((fn: (prev: ChallengeState) => ChallengeState) => {
    setState((prev) => {
      const next = fn(prev)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage can be unavailable (private mode); keep going in memory.
      }
      return next
    })
  }, [])

  return {
    ...state,
    hydrated,
    setProfile: (profile: Partial<Pick<ChallengeState, 'name' | 'team'>>) =>
      update((prev) => ({ ...prev, ...profile })),
    setMyOrder: (myOrder: string[]) =>
      update((prev) => (prev.myLocked ? prev : { ...prev, myOrder })),
    lockMine: () => update((prev) => ({ ...prev, myLocked: true })),
    unlockMine: () =>
      update((prev) => (prev.teamLocked ? prev : { ...prev, myLocked: false })),
    setTeamOrder: (teamOrder: string[]) =>
      update((prev) => (prev.teamLocked ? prev : { ...prev, teamOrder })),
    lockTeam: () =>
      update((prev) => ({
        ...prev,
        teamOrder: prev.teamOrder ?? prev.myOrder,
        teamLocked: true,
      })),
    reset: () => update(() => DEFAULT_STATE),
  }
}
