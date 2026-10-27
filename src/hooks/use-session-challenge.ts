import { useCallback, useEffect, useState } from 'react'
import { INITIAL_ORDER, isValidOrder } from '#/lib/nasa'
import type { ParticipantState } from '#/lib/session-types'
import { useSessionSocket } from '#/hooks/use-session-socket'
import {
  getParticipantState,
  lockIndividual,
  lockTeam,
  unlockIndividual,
} from '#/server/participant'

interface Drafts {
  myOrder: string[] | null
  teamOrder: string[] | null
}

const NO_DRAFTS: Drafts = { myOrder: null, teamOrder: null }

const idKey = (code: string) => `moon-survival:session:${code}`
const draftKey = (code: string) => `moon-survival:drafts:${code}`

export function readParticipantId(code: string) {
  try {
    return window.localStorage.getItem(idKey(code))
  } catch {
    return null
  }
}

export function saveParticipantId(code: string, participantId: string) {
  try {
    window.localStorage.setItem(idKey(code), participantId)
  } catch {
    // Storage can be unavailable (private mode); the join just won't survive a reload.
  }
}

function loadDrafts(code: string): Drafts {
  try {
    const raw = window.localStorage.getItem(draftKey(code))
    if (!raw) return NO_DRAFTS
    const parsed = JSON.parse(raw) as Partial<Drafts>
    return {
      myOrder: isValidOrder(parsed.myOrder) ? parsed.myOrder : null,
      teamOrder: isValidOrder(parsed.teamOrder) ? parsed.teamOrder : null,
    }
  } catch {
    return NO_DRAFTS
  }
}

/**
 * Server state (D1) is the truth for joins, locks and scores. Only the
 * in-progress, unlocked orderings live in localStorage as drafts.
 */
export function useSessionChallenge(code: string) {
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [state, setState] = useState<ParticipantState | null>(null)
  const [drafts, setDrafts] = useState<Drafts>(NO_DRAFTS)
  const [hydrated, setHydrated] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!participantId) return
    try {
      const next = await getParticipantState({ data: { participantId } })
      setState(next)
    } catch {
      // Offline blip: keep what we have, the socket reconnect refetches.
    }
  }, [participantId])

  useEffect(() => {
    const id = readParticipantId(code)
    setDrafts(loadDrafts(code))
    setParticipantId(id)
    if (!id) {
      setHydrated(true)
      return
    }
    getParticipantState({ data: { participantId: id } })
      .then((next) => {
        if (!next) {
          setParticipantId(null)
          return
        }
        setState(next)
      })
      .catch(() => {})
      .finally(() => setHydrated(true))
  }, [code])

  useSessionSocket(state?.sessionId ?? null, participantId, refresh)

  const updateDrafts = (patch: Partial<Drafts>) =>
    setDrafts((prev) => {
      const next = { ...prev, ...patch }
      try {
        window.localStorage.setItem(draftKey(code), JSON.stringify(next))
      } catch {
        // Keep going in memory.
      }
      return next
    })

  const run = async (action: () => Promise<ParticipantState | null>) => {
    setPending(true)
    setError(null)
    try {
      const next = await action()
      if (next) setState(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  const myLocked = state?.myLocked ?? false
  const teamLocked = state?.teamLocked ?? false
  const myOrder =
    (myLocked ? state?.myOrder : null) ?? drafts.myOrder ?? INITIAL_ORDER
  const teamOrder =
    (teamLocked ? state?.teamOrder : null) ?? drafts.teamOrder ?? myOrder

  return {
    hydrated,
    joined: state !== null,
    pending,
    error,
    participantId,
    name: state?.name ?? '',
    teamName: state?.teamName ?? '',
    teamLockedBy: state?.teamLockedBy ?? null,
    sessionClosed: state?.sessionClosed ?? false,
    myLocked,
    teamLocked,
    myOrder,
    teamOrder,
    setMyOrder: (order: string[]) => {
      if (!myLocked) updateDrafts({ myOrder: order })
    },
    setTeamOrder: (order: string[]) => {
      if (!teamLocked) updateDrafts({ teamOrder: order })
    },
    lockMine: () =>
      run(() =>
        lockIndividual({
          data: { participantId: participantId!, order: myOrder },
        }),
      ),
    unlockMine: () =>
      run(() => unlockIndividual({ data: { participantId: participantId! } })),
    lockTeam: () =>
      run(() =>
        lockTeam({ data: { participantId: participantId!, order: teamOrder } }),
      ),
  }
}
