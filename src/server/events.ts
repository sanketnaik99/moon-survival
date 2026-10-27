export type SessionEvent =
  | { type: 'participant-joined'; teamId: string }
  | { type: 'individual-locked'; teamId: string }
  | { type: 'team-locked'; teamId: string }
  | { type: 'session-changed' }
