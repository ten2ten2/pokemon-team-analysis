import type { Move, TypeName } from '@pkmn/data'
import type { Pokemon } from '~/lib/core/types'
import { dataService } from '~/lib/core/dataService'

export function resolveMove(move: Move, pokemon: Pokemon): Move {
  if (move.id !== 'ivycudgel') return move
  const type: TypeName = pokemon.species.startsWith('Ogerpon-Hearthflame') ? 'Fire'
    : pokemon.species.startsWith('Ogerpon-Wellspring') ? 'Water'
    : pokemon.species.startsWith('Ogerpon-Cornerstone') ? 'Rock' : 'Grass'
  return { ...move, type }
}

export function moveEffectiveness(move: Move, defendingTypes: readonly string[]): number {
  const types = dataService.getGeneration().types
  return [...new Set(defendingTypes)].filter(Boolean).reduce((multiplier, type) => {
    let factor = move.id === 'freezedry' && type === 'Water' ? 2
      : types.totalEffectiveness(move.type, [type as TypeName])
    if (move.id === 'flyingpress') factor *= types.totalEffectiveness('Flying', [type as TypeName])
    return multiplier * factor
  }, 1)
}
