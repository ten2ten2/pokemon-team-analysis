import type { Specie, Move } from '@pkmn/data'
import { BaseAnalyzer } from '~/lib/analyzer/baseAnalyzer'
import type { Pokemon } from '~/lib/core/types'
import { estimateDamage } from '~/lib/calculator/statsEstimator'
import { getPokeApiNum } from '~/lib/data/sprites'
import { moveEffectiveness, resolveMove } from '~/lib/calculator/moveEffectiveness'
import { POPULAR_POKEMON } from '~/lib/core/constants'

// ==================== Types ====================

export interface CoverageAnalysisOptions {
  combination?: { type1: string; type2: string }
}

export interface CoverageAnalysisResult {
  combinationCoverage: CombinationCoverage | null
  popularPokemonCoverage: PokemonCoverage[]
}

export interface CombinationCoverage {
  type1: string
  type2: string
  effectiveMovesPhysical: MoveEffectivenessInfo[]
  neutralMovesPhysical: MoveEffectivenessInfo[]
  resistantMovesPhysical: MoveEffectivenessInfo[]
  immuneMovesPhysical: MoveEffectivenessInfo[]
  effectiveMovesSpecial: MoveEffectivenessInfo[]
  neutralMovesSpecial: MoveEffectivenessInfo[]
  resistantMovesSpecial: MoveEffectivenessInfo[]
  immuneMovesSpecial: MoveEffectivenessInfo[]
}

export interface PokemonCoverage {
  pokemon: Specie
  pokeApiNum: number
  bestMoves: {
    physical: MoveEffectivenessInfo[]
    special: MoveEffectivenessInfo[]
    overall: MoveEffectivenessInfo[]
  }
}

export interface MoveEffectivenessInfo extends Move {
  readonly effectiveness: number
  readonly pokemon: Pokemon
  readonly hasSTAB: boolean
  readonly damageScore: number
}

// ==================== Coverage Analyzer ====================

export class CoverageAnalyzer extends BaseAnalyzer<CoverageAnalysisResult, CoverageAnalysisOptions> {


  analyze(team: Pokemon[], options?: CoverageAnalysisOptions): CoverageAnalysisResult {
    let combinationCoverage: CombinationCoverage | null = null;
    if (options?.combination) {
      combinationCoverage = this.calculateCoverageForCombination(team, options?.combination)
    }

    const popularPokemonCoverage = this.generatePopularPokemonCoverage(POPULAR_POKEMON, team)

    return {
      combinationCoverage,
      popularPokemonCoverage
    }
  }

  // 计算组合覆盖
  private calculateCoverageForCombination(team: Pokemon[], options?: { type1: string; type2: string }): CombinationCoverage {
    const { type1 = '', type2 = '' } = options || {}
    const combinationCoverage: CombinationCoverage = {
      type1: type1,
      type2: type2,
      effectiveMovesPhysical: [],
      neutralMovesPhysical: [],
      resistantMovesPhysical: [],
      immuneMovesPhysical: [],
      effectiveMovesSpecial: [],
      neutralMovesSpecial: [],
      resistantMovesSpecial: [],
      immuneMovesSpecial: []
    }
    if (type1 === '' && type2 === '') {
      return combinationCoverage
    }

    const combinationTypes: string[] = type1 === type2 ? [type1] : [type1, type2]
    for (const pokemon of team) {
      this.calculatePokemonMovesCoverage(pokemon, combinationTypes, combinationCoverage)
    }

    // 排序招式
    const sortFn = (a: MoveEffectivenessInfo, b: MoveEffectivenessInfo) => b.damageScore - a.damageScore
    combinationCoverage.effectiveMovesPhysical.sort(sortFn)
    combinationCoverage.neutralMovesPhysical.sort(sortFn)
    combinationCoverage.resistantMovesPhysical.sort(sortFn)
    combinationCoverage.immuneMovesPhysical.sort(sortFn)
    combinationCoverage.effectiveMovesSpecial.sort(sortFn)
    combinationCoverage.neutralMovesSpecial.sort(sortFn)
    combinationCoverage.resistantMovesSpecial.sort(sortFn)
    combinationCoverage.immuneMovesSpecial.sort(sortFn)

    return combinationCoverage
  }

  // 计算单个宝可梦的招式覆盖
  private calculatePokemonMovesCoverage(pokemon: Pokemon, combinationTypes: string[], combinationCoverage: CombinationCoverage): void {
    const { movesDetails } = pokemon
    for (const original of Object.values(movesDetails)) {
      const detail = resolveMove(original, pokemon)
      if (detail.category === 'Status') continue

      const effectiveness = moveEffectiveness(detail, combinationTypes)
      const moveEffectivenessInfo = this.buildMoveEffectivenessInfo(detail, pokemon, effectiveness)

      if (detail.category === 'Physical') {
        if (effectiveness === 0) {
          combinationCoverage.immuneMovesPhysical.push(moveEffectivenessInfo)
        } else if (effectiveness > 0 && effectiveness < 1) {
          combinationCoverage.resistantMovesPhysical.push(moveEffectivenessInfo)
        } else if (effectiveness === 1) {
          combinationCoverage.neutralMovesPhysical.push(moveEffectivenessInfo)
        } else {
          combinationCoverage.effectiveMovesPhysical.push(moveEffectivenessInfo)
        }
      } else {
        if (effectiveness === 0) {
          combinationCoverage.immuneMovesSpecial.push(moveEffectivenessInfo)
        } else if (effectiveness > 0 && effectiveness < 1) {
          combinationCoverage.resistantMovesSpecial.push(moveEffectivenessInfo)
        } else if (effectiveness === 1) {
          combinationCoverage.neutralMovesSpecial.push(moveEffectivenessInfo)
        } else {
          combinationCoverage.effectiveMovesSpecial.push(moveEffectivenessInfo)
        }
      }
    }
  }

  // 构建招式覆盖信息
  private buildMoveEffectivenessInfo(move: Move, pokemon: Pokemon, effectiveness: number): MoveEffectivenessInfo {
    const { atk, spa } = pokemon.stats
    const hasSTAB = pokemon.types.includes(move.type)

    const damage = estimateDamage(
      { atk, spa, level: pokemon.level, STAB: hasSTAB, effectiveness },
      { def: 120, spd: 120 },
      move
    )

    return {
      ...move,
      effectiveness,
      pokemon,
      hasSTAB,
      damageScore: damage
    }
  }

  // 生成热门宝可梦覆盖情况
  private generatePopularPokemonCoverage(popularList: string[], team: Pokemon[]): PokemonCoverage[] {
    const popularPokemonCoverage: PokemonCoverage[] = []
    popularList.forEach(pokemonName => {
      const pokemon = this.dataService.getGeneration().species.get(pokemonName)
      if (!pokemon) return
      const pokeApiNum = getPokeApiNum(pokemonName, pokemon.num)

      const physical: MoveEffectivenessInfo[] = []
      const special: MoveEffectivenessInfo[] = []
      const overall: MoveEffectivenessInfo[] = []

      team.forEach(p => {
        for (const original of Object.values(p.movesDetails)) {
          const detail = resolveMove(original, p)
          if (detail.category === 'Status') continue

          const effectiveness = moveEffectiveness(detail, pokemon.types)
          const moveEffectivenessInfo = this.buildMoveEffectivenessInfo(detail, p, effectiveness)
          if (detail.category === 'Physical') {
            physical.push(moveEffectivenessInfo)
          } else {
            special.push(moveEffectivenessInfo)
          }
          overall.push(moveEffectivenessInfo)
        }
      })

      const sortFn = (a: MoveEffectivenessInfo, b: MoveEffectivenessInfo) => {
        if (a.effectiveness === b.effectiveness) {
          return b.damageScore - a.damageScore
        }
        return b.effectiveness - a.effectiveness
      }
      physical.sort(sortFn)
      special.sort(sortFn)
      overall.sort(sortFn)

      popularPokemonCoverage.push({
        pokemon: pokemon,
        pokeApiNum: pokeApiNum,
        bestMoves: {
          physical,
          special,
          overall
        }
      })
    })

    return popularPokemonCoverage
  }
}

export interface MoveDisplayInfo {
  name: string
  pokemon: string
  type: string
  power: string | number
  effectiveness: string
  hasSTAB: boolean
}
