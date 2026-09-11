import type { Move } from '@pkmn/data'
import { STAB_MULTIPLIER } from '~/lib/core/constants'

// Ranking heuristic with neutral defenses. This is not an in-battle damage calculator.
export function estimateDamage(
  { atk, spa, level, STAB, effectiveness }: {
    atk: number; spa: number; level: number; STAB: boolean; effectiveness: number
  },
  { def, spd }: { def: number; spd: number },
  move: Move,
): number {
  if (!move.basePower || effectiveness === 0) return 0
  const attack = move.category === 'Physical' ? atk : spa
  const defense = move.category === 'Physical' ? def : spd
  return Math.floor(((2 * level + 10) / 250 * (attack / defense) * move.basePower + 2)
    * (STAB ? STAB_MULTIPLIER : 1) * effectiveness)
}
