import type { PokemonSet } from '@pkmn/types'
import type { StatsTable } from '@pkmn/types'
import type { Move } from '@pkmn/data'



export interface Pokemon extends PokemonSet {
  baseStats: StatsTable
  stats: StatsTable
  types: string[]
  pokeApiNum: number
  movesDetails: Record<string, Move>
}


// ==================== Resistance Analysis ====================

export interface ItemEffect {
  immunities?: string[];
  multipliers?: Record<string, number>;
  specialHandling?: boolean;
}
