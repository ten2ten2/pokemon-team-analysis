import type { Specie, Move, TypeName } from '@pkmn/data'
import { BaseAnalyzer } from '~/lib/analyzer/baseAnalyzer'
import type { Pokemon } from '~/lib/core/types'
import { estimateDamageLevel50 } from '~/lib/calculator/statsEstimator'
import { getPokeApiNum } from '~/lib/parser/teamParser'

// ==================== Types ====================

export interface CoverageAnalysisOptions {
  combination?: { type1: string; type2: string }
}

export interface CoverageAnalysisResult {
  combinationCoverage: CombinationCoverage
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

  getAnalysisType(): string {
    return 'coverage'
  }

  analyze(team: Pokemon[], options?: CoverageAnalysisOptions): CoverageAnalysisResult {
    let combinationCoverage;
    if (options?.combination) {
      combinationCoverage = this.calculateCoverageForCombination(team, options?.combination)
    }

    const popularList = ['Pikachu', 'Eevee', 'Charmander', 'Bulbasaur', 'Squirtle']
    const popularPokemonCoverage = this.generatePopularPokemonCoverage(popularList, team)

    return {
      combinationCoverage: combinationCoverage as CombinationCoverage,
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
    for (const [name, detail] of Object.entries(movesDetails)) {
      if (detail.category === 'Status') continue

      const effectiveness = this.dataService.getGeneration().types.totalEffectiveness(detail.type, combinationTypes as TypeName[])
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

    const damage = estimateDamageLevel50(
      { atk, spa, STAB: hasSTAB, effectiveness },
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
      const pokeApiNum = getPokeApiNum(pokemonName)

      const physical: MoveEffectivenessInfo[] = []
      const special: MoveEffectivenessInfo[] = []
      const overall: MoveEffectivenessInfo[] = []

      team.forEach(p => {
        for (const [name, detail] of Object.entries(p.movesDetails)) {
          if (detail.category === 'Status') continue

          const effectiveness = this.dataService.getGeneration().types.totalEffectiveness(detail.type, pokemon.types as TypeName[])
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
// ==================== Export ====================

export const coverageAnalyzer = new CoverageAnalyzer()
export default coverageAnalyzer
