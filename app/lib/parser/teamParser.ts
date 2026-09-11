import { Dex, Teams, TeamValidator } from '@pkmn/sim'
import type { GenerationNum } from '@pkmn/types'
import type { Move } from '@pkmn/data'
import { DEFAULT_GENERATION, DEFAULT_LEVEL } from '~/lib/core/constants'
import type { Pokemon } from '~/lib/core/types'
import { getPokeApiNum } from '~/lib/data/sprites'
import { initializeFormats } from '~/lib/core/formats/formatInitializer'
import { dataService } from '~/lib/core/dataService'
import { calculateStats } from '~/lib/calculator/statsCalculator'

export function parseAndValidateTeam(
  raw: string, rule: string, generation: GenerationNum = DEFAULT_GENERATION,
): { teamParsed: Pokemon[]; errors: string[] } {
  try {
    initializeFormats()
    const sets = Teams.import(raw)
    if (!sets?.length) return { teamParsed: [], errors: ['Invalid team data format'] }
    const inputMoves = sets.map(set => [...set.moves])
    const validator = new TeamValidator(rule, Dex)
    const errors = validator.validateTeam(sets) ?? []
    const gen = dataService.getGeneration(generation)
    const teamParsed: Pokemon[] = []

    for (const [index, set] of sets.entries()) {
      const species = gen.species.get(set.species)
      if (!species) {
        errors.push(`Species not found: ${set.species}`)
        continue
      }
      // Apply the format level even when another validation error prevents set normalization.
      const level = validator.ruleTable.adjustLevel ?? set.level ?? DEFAULT_LEVEL
      const moves = set.moves.map((name, moveIndex) =>
        gen.moves.get(name)?.name ?? inputMoves[index]?.[moveIndex] ?? name)
      const movesDetails: Record<string, Move> = {}
      for (const name of moves) {
        const move = gen.moves.get(name)
        if (move) movesDetails[name] = move
      }
      teamParsed.push({
        ...set, species: species.name, level, moves,
        baseStats: species.baseStats, types: [...species.types], movesDetails,
        stats: calculateStats(species.baseStats, set.ivs, set.evs, level, set.nature, generation),
        pokeApiNum: getPokeApiNum(species.name, species.num),
      })
    }
    return { teamParsed, errors }
  } catch (error) {
    return { teamParsed: [], errors: [`Parsing failed: ${error instanceof Error ? error.message : String(error)}`] }
  }
}
