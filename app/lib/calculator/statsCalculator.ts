import type { StatsTable, StatID, GenerationNum } from '@pkmn/types'
import { DEFAULT_BASE_STATS, DEFAULT_IVS, DEFAULT_EVS, DEFAULT_GENERATION } from '~/lib/core/constants'
import { dataService } from '~/lib/core/dataService'

const STAT_IDS: StatID[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']

export function calculateStats(
  baseStats: Partial<StatsTable> | undefined,
  ivs: Partial<StatsTable> | undefined,
  evs: Partial<StatsTable> | undefined,
  level: number,
  nature = 'Hardy',
  generation: GenerationNum = DEFAULT_GENERATION,
): StatsTable {
  if (!Number.isInteger(level) || level < 1 || level > 100) {
    throw new Error(`Invalid level: ${level}`)
  }
  const gen = dataService.getGeneration(generation)
  return Object.fromEntries(STAT_IDS.map(stat => [stat, gen.stats.calc(
    stat, baseStats?.[stat] ?? DEFAULT_BASE_STATS[stat],
    ivs?.[stat] ?? DEFAULT_IVS[stat], evs?.[stat] ?? DEFAULT_EVS[stat],
    level, gen.natures.get(nature),
  )])) as StatsTable
}
