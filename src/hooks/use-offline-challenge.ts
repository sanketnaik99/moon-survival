import { useEffect, useState } from 'react'
import type { ChallengeView } from '#/lib/challenge-types'
import { INITIAL_ORDER, isValidOrder } from '#/lib/nasa'

interface OfflineState {
  myOrder: string[]
  myLocked: boolean
  teamOrder: string[]
  teamLocked: boolean
}

const FRESH: OfflineState = {
  myOrder: INITIAL_ORDER,
  myLocked: false,
  teamOrder: INITIAL_ORDER,
  teamLocked: false,
}

const STORAGE_KEY = 'moon-survival:offline'

function load(): OfflineState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return FRESH
    const parsed = JSON.parse(raw) as Partial<OfflineState>
    return {
      myOrder: isValidOrder(parsed.myOrder) ? parsed.myOrder : INITIAL_ORDER,
      myLocked: parsed.myLocked === true && isValidOrder(parsed.myOrder),
      teamOrder: isValidOrder(parsed.teamOrder)
        ? parsed.teamOrder
        : INITIAL_ORDER,
      teamLocked:
        parsed.myLocked === true &&
        parsed.teamLocked === true &&
        isValidOrder(parsed.teamOrder),
    }
  } catch {
    return FRESH
  }
}

function save(state: OfflineState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode); keep going in memory.
  }
}

/**
 * Solo play with no session: everything lives in localStorage and scores are
 * computed on the client. Read after mount, never during SSR.
 */
export function useOfflineChallenge(): ChallengeView & { reset: () => void } {
  const [state, setState] = useState<OfflineState>(FRESH)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(load())
    setHydrated(true)
  }, [])

  const update = (patch: Partial<OfflineState>) => {
    const next = { ...state, ...patch }
    save(next)
    setState(next)
  }

  return {
    hydrated,
    joined: true,
    pending: false,
    error: null,
    teamName: '',
    teamLockedBy: null,
    myLocked: state.myLocked,
    teamLocked: state.teamLocked,
    myOrder: state.myOrder,
    teamOrder: state.teamOrder,
    setMyOrder: (order) => {
      if (!state.myLocked) update({ myOrder: order })
    },
    setTeamOrder: (order) => {
      if (!state.teamLocked) update({ teamOrder: order })
    },
    lockMine: () => {
      if (!state.myLocked) update({ myLocked: true })
    },
    lockTeam: () => {
      if (state.myLocked && !state.teamLocked) update({ teamLocked: true })
    },
    reset: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Nothing stored, nothing to clear.
      }
      setState(FRESH)
    },
  }
}
