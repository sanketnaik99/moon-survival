export interface SurvivalItem {
  id: string
  name: string
  nasaRank: number
  reasoning: string
}

// Listed in the participant handout order.
export const ITEMS: SurvivalItem[] = [
  {
    id: 'matches',
    name: 'Box of matches',
    nasaRank: 15,
    reasoning: 'Useless, since fire needs oxygen',
  },
  {
    id: 'food',
    name: 'Food concentrate',
    nasaRank: 4,
    reasoning: 'An efficient way to meet energy needs',
  },
  {
    id: 'rope',
    name: '50 feet of nylon rope',
    nasaRank: 6,
    reasoning: 'Useful for climbing cliffs and tying injured crew together',
  },
  {
    id: 'parachute',
    name: 'Parachute silk',
    nasaRank: 8,
    reasoning: "Protection from the sun's rays",
  },
  {
    id: 'heater',
    name: 'Portable heating unit',
    nasaRank: 13,
    reasoning: 'Not needed on the lighted side',
  },
  {
    id: 'pistols',
    name: 'Two .45 caliber pistols',
    nasaRank: 11,
    reasoning: 'Their recoil could possibly be used for propulsion',
  },
  {
    id: 'milk',
    name: 'One case of dehydrated milk',
    nasaRank: 12,
    reasoning: 'Food, but bulky, and it needs water',
  },
  {
    id: 'oxygen',
    name: 'Two 100 lb tanks of oxygen',
    nasaRank: 1,
    reasoning: "There's no air on the moon, so this is the most urgent need",
  },
  {
    id: 'map',
    name: "Stellar map (of the moon's constellations)",
    nasaRank: 3,
    reasoning: 'The main way to navigate',
  },
  {
    id: 'raft',
    name: 'Self-inflating life raft',
    nasaRank: 9,
    reasoning: 'Its CO2 bottles can provide propulsion, and it can carry gear',
  },
  {
    id: 'compass',
    name: 'Magnetic compass',
    nasaRank: 14,
    reasoning: "The moon has no useful magnetic field, so it doesn't work",
  },
  {
    id: 'water',
    name: '5 gallons of water',
    nasaRank: 2,
    reasoning: 'Replaces fluid lost on the hot lighted side',
  },
  {
    id: 'flares',
    name: 'Signal flares',
    nasaRank: 10,
    reasoning: "A distress signal once you're in sight of the ship",
  },
  {
    id: 'firstaid',
    name: 'First aid kit with injection needle',
    nasaRank: 7,
    reasoning:
      'Needles can be used through suit fittings for medicine and vitamins',
  },
  {
    id: 'radio',
    name: 'Solar-powered FM receiver-transmitter',
    nasaRank: 5,
    reasoning: 'Lets you contact the mother ship at short range',
  },
]

export const INITIAL_ORDER: string[] = ITEMS.map((item) => item.id)

export const ITEMS_BY_ID: Record<string, SurvivalItem> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item]),
)

export const ITEMS_BY_NASA_RANK: SurvivalItem[] = [...ITEMS].sort(
  (a, b) => a.nasaRank - b.nasaRank,
)

export interface ItemScore {
  id: string
  rank: number
  diff: number
}

export function scoreRanking(order: string[]): {
  total: number
  perItem: Record<string, ItemScore>
} {
  const perItem: Record<string, ItemScore> = {}
  let total = 0
  order.forEach((id, index) => {
    const rank = index + 1
    const diff = Math.abs(rank - ITEMS_BY_ID[id].nasaRank)
    perItem[id] = { id, rank, diff }
    total += diff
  })
  return { total, perItem }
}

export type BandTone =
  'excellent' | 'good' | 'average' | 'fair' | 'poor' | 'very-poor'

export interface ScoreBand {
  label: string
  range: string
  max: number
  tone: BandTone
  /** What the score means for the crew's chances of surviving the trip. */
  survival: string
}

export const SCORE_BANDS: ScoreBand[] = [
  {
    label: 'Excellent',
    range: '0–25',
    max: 25,
    tone: 'excellent',
    survival:
      'Excellent chances of survival. The crew reaches the mother ship.',
  },
  {
    label: 'Good',
    range: '26–32',
    max: 32,
    tone: 'good',
    survival: 'Good chances of survival. The crew very likely makes it.',
  },
  {
    label: 'Average',
    range: '33–45',
    max: 45,
    tone: 'average',
    survival: 'Average chances of survival. It could go either way.',
  },
  {
    label: 'Fair',
    range: '46–55',
    max: 55,
    tone: 'fair',
    survival: 'Fair chances of survival. The crew is in real danger.',
  },
  {
    label: 'Poor',
    range: '56–70',
    max: 70,
    tone: 'poor',
    survival:
      'Poor chances of survival. Suggests the use of Earth-bound logic.',
  },
  {
    label: 'Very poor',
    range: '71–112',
    max: Infinity,
    tone: 'very-poor',
    survival:
      'Very poor chances of survival. The crew are casualties of the space program!',
  },
]

export function getBand(total: number): ScoreBand {
  return SCORE_BANDS.find((band) => total <= band.max) ?? SCORE_BANDS[5]
}

export const SCENARIO = [
  'You are part of a space crew that was supposed to meet a mother ship on the lighted surface of the moon. Mechanical trouble forced your ship to crash-land about 200 miles from the meeting point.',
  "Much of the equipment was damaged during landing, and the crew's survival depends on reaching the mother ship. Only 15 items came through undamaged.",
]

export const DEBRIEF_QUESTIONS = [
  'How did your team score compare with your own individual score?',
  'Did the team beat its average member? Its best member?',
  'Who changed their mind during the discussion, and what convinced them?',
  'Was there knowledge on the team that never got shared? Why not?',
  'If your best individual beat the team, what happened? Was their view outvoted, or did they never speak up?',
  "How does this compare with how we make decisions at work? Where are we working solo when we shouldn't be?",
]

export const TAKEAWAY =
  "In most groups the team score beats the average individual score, and often beats the best individual too. Combining different knowledge and challenging each other's assumptions leads to better decisions than anyone reaches alone."
