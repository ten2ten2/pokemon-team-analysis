import { Generations } from '@pkmn/data'
import type { Move } from '@pkmn/dex'
import type { Team } from '~/types/team'
import { Dex } from '@pkmn/dex'

// ============================================================================
// 常量定义
// ============================================================================

// 热门宝可梦列表（基于VGC使用率）
const POPULAR_POKEMON = [
  'Incineroar', 'Rillaboom', 'Grimmsnarl', 'Dragapult', 'Torkoal', 'Venusaur',
  'Charizard', 'Lapras', 'Tyranitar', 'Excadrill', 'Togekiss', 'Whimsicott',
  'Dusclops', 'Conkeldurr', 'Rotom-Heat', 'Gastrodon', 'Coalossal', 'Rhyperior',
  'Indeedee', 'Hatterne', 'Dracovish', 'Milotic', 'Butterfree', 'Corviknight',
  'Lucario', 'Rotom-Wash', 'Mimikyu', 'Clefairy', 'Arcanine', 'Magnezone',
  'Porygon2', 'Sylveon', 'Politoed', 'Kingdra', 'Ludicolo', 'Amoonguss',
  'Volcarona', 'Tapu Fini', 'Celesteela', 'Kartana'
] as const

// 热门属性组合
const POPULAR_TYPE_COMBINATIONS = [
  ['Fire', 'Fighting'], ['Grass', 'Poison'], ['Electric', 'Flying'],
  ['Water', 'Ground'], ['Psychic', 'Fairy'], ['Dark', 'Flying'],
  ['Steel', 'Flying'], ['Ghost', 'Poison'], ['Dragon', 'Flying'],
  ['Fighting', 'Steel'], ['Fire', 'Flying'], ['Water', 'Flying'],
  ['Grass', 'Flying'], ['Electric', 'Steel'], ['Rock', 'Ground'],
  ['Ice', 'Flying'], ['Bug', 'Flying'], ['Normal', 'Flying'],
  ['Fire', 'Ground'], ['Water', 'Psychic']
] as const

// 性能常量
const STAB_MULTIPLIER = 1.5
const DEFAULT_BASE_STAT = 100
const MAX_MOVES_PER_CATEGORY = 5
const CACHE_SIZE_LIMIT = 100

// ============================================================================
// 类型定义
// ============================================================================

export interface MoveInfo extends Move {
  readonly effectiveness: number
  readonly pokemon: string
  readonly damageScore: number
  readonly hasSTAB: boolean
}

export interface CoverageForCombinationUnit {
  readonly type1: string
  readonly type2: string
  readonly effectiveMovesPhysical: readonly MoveInfo[]
  readonly neutralMovesPhysical: readonly MoveInfo[]
  readonly resistantMovesPhysical: readonly MoveInfo[]
  readonly immuneMovesPhysical: readonly MoveInfo[]
  readonly effectiveMovesSpecial: readonly MoveInfo[]
  readonly neutralMovesSpecial: readonly MoveInfo[]
  readonly resistantMovesSpecial: readonly MoveInfo[]
  readonly immuneMovesSpecial: readonly MoveInfo[]
  readonly level: CoverageLevel
  readonly score: number
  readonly levelPhysical: CoverageLevel
  readonly scorePhysical: number
  readonly levelSpecial: CoverageLevel
  readonly scoreSpecial: number
  readonly isPopular: boolean
}

export interface PopularPokemonCoverage {
  readonly pokemon: string
  readonly types: readonly string[]
  readonly bestMoves: {
    readonly physical: readonly MoveInfo[]
    readonly special: readonly MoveInfo[]
    readonly overall: readonly MoveInfo[]
  }
  readonly coverageLevel: CoverageLevel
  readonly overallScore: number
}

export type CoverageLevel = 'Effective' | 'Neutral' | 'Resistant' | 'Immune'

export interface CoverageAnalysisResult {
  readonly typeCoverageMatrix: ReadonlyMap<string, ReadonlyMap<string, CoverageForCombinationUnit | null>>
  readonly popularPokemonCoverage: readonly PopularPokemonCoverage[]
  readonly teamInfo: {
    readonly id: string
    readonly name: string
    readonly pokemonCount: number
  }
}

// ============================================================================
// 缓存系统
// ============================================================================

interface CacheEntry<T> {
  readonly value: T
  readonly timestamp: number
}

class LRUCache<K, V> {
  private readonly cache = new Map<string, CacheEntry<V>>()
  private readonly maxSize: number
  private readonly ttl: number

  constructor(maxSize = CACHE_SIZE_LIMIT, ttlMs = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttlMs
  }

  get(key: K): V | undefined {
    const keyStr = this.serializeKey(key)
    const entry = this.cache.get(keyStr)

    if (!entry) return undefined

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(keyStr)
      return undefined
    }

    // LRU: 重新插入以更新位置
    this.cache.delete(keyStr)
    this.cache.set(keyStr, entry)

    return entry.value
  }

  set(key: K, value: V): void {
    const keyStr = this.serializeKey(key)

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(keyStr, {
      value,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  private serializeKey(key: K): string {
    return typeof key === 'string' ? key : JSON.stringify(key)
  }
}

// ============================================================================
// 工具函数
// ============================================================================

const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

const isPopularCombination = memoize((type1: string, type2: string): boolean => {
  return POPULAR_TYPE_COMBINATIONS.some(combo =>
    (combo[0] === type1 && combo[1] === type2) ||
    (combo[0] === type2 && combo[1] === type1)
  )
})

const calculateDamageScore = (
  basePower: number,
  effectiveness: number,
  hasSTAB: boolean,
  attackStat: number
): number => {
  const stabMultiplier = hasSTAB ? STAB_MULTIPLIER : 1
  return basePower * effectiveness * stabMultiplier * (attackStat / 100)
}

const estimateAttackStat = memoize((pokemon: any, isSpecial: boolean): number => {
  const evKey = isSpecial ? 'spa' : 'atk'
  const ivKey = isSpecial ? 'spa' : 'atk'

  const evValue = pokemon.evs?.[evKey] || 0
  const ivValue = pokemon.ivs?.[ivKey] || 31

  return Math.floor(((2 * DEFAULT_BASE_STAT + ivValue + Math.floor(evValue / 4)) * 50) / 100 + 5)
})

// ============================================================================
// 覆盖分析器
// ============================================================================

export class CoverageAnalyzer {
  private readonly gen: any
  private readonly types: any
  private readonly moveCache = new LRUCache<string, any>()
  private readonly speciesCache = new LRUCache<string, any>()
  private readonly effectivenessCache = new LRUCache<string, number>()

  constructor(generation: number = 9) {
    try {
      this.gen = new Generations(Dex).get(generation)
      this.types = this.gen.types
    } catch (error) {
      throw new Error(`Failed to initialize CoverageAnalyzer: ${error}`)
    }
  }

  analyze(team: Team): CoverageAnalysisResult {
    if (!team?.teamData?.length) {
      throw new Error('Invalid team data provided')
    }

    try {
      const allTypes = this.getAllTypes()
      const typeCoverageMatrix = this.buildTypeCoverageMatrix(team, allTypes)
      const popularPokemonCoverage = this.analyzePopularPokemonCoverage(team)

      return {
        typeCoverageMatrix,
        popularPokemonCoverage,
        teamInfo: {
          id: team.id || '',
          name: team.name || '',
          pokemonCount: team.teamData.length
        }
      }
    } catch (error) {
      console.error('Coverage analysis failed:', error)
      throw new Error(`Coverage analysis failed: ${error}`)
    }
  }

  private getAllTypes(): readonly string[] {
    return Array.from(this.types, (t: any) => t.name).filter((t: any) => t !== 'Stellar')
  }

  private buildTypeCoverageMatrix(
    team: Team,
    allTypes: readonly string[]
  ): ReadonlyMap<string, ReadonlyMap<string, CoverageForCombinationUnit | null>> {
    const matrix = new Map<string, Map<string, CoverageForCombinationUnit | null>>()

    // 初始化矩阵
    for (const type1 of allTypes) {
      const row = new Map<string, CoverageForCombinationUnit | null>()
      for (const type2 of allTypes) {
        row.set(type2, null)
      }
      matrix.set(type1, row)
    }

    // 只计算上三角矩阵（包括对角线）
    for (let i = 0; i < allTypes.length; i++) {
      const type1 = allTypes[i]

      for (let j = i; j < allTypes.length; j++) {
        const type2 = allTypes[j]
        const unit = this.analyzeCombination(team, type1, type2)
        matrix.get(type1)!.set(type2, unit)
      }
    }

    // 转换为只读Map
    const readonlyMatrix = new Map<string, ReadonlyMap<string, CoverageForCombinationUnit | null>>()
    for (const [type1, row] of matrix) {
      readonlyMatrix.set(type1, new Map(row))
    }

    return readonlyMatrix
  }

  private analyzeCombination(team: Team, type1: string, type2: string): CoverageForCombinationUnit {
    const combinationTypes = type1 === type2 ? [type1] : [type1, type2]
    const isPopular = isPopularCombination(type1, type2)

    // 分类存储招式
    const moveCategories = {
      effectiveMovesPhysical: [] as MoveInfo[],
      neutralMovesPhysical: [] as MoveInfo[],
      resistantMovesPhysical: [] as MoveInfo[],
      immuneMovesPhysical: [] as MoveInfo[],
      effectiveMovesSpecial: [] as MoveInfo[],
      neutralMovesSpecial: [] as MoveInfo[],
      resistantMovesSpecial: [] as MoveInfo[],
      immuneMovesSpecial: [] as MoveInfo[]
    }

    // 分析每只宝可梦的招式
    for (const pokemon of team.teamData || []) {
      this.analyzePokemonMoves(pokemon, combinationTypes, moveCategories)
    }

    // 排序并限制数量
    this.sortAndLimitMoves(moveCategories)

    // 计算等级和分数
    const scores = this.calculateScores(moveCategories)

    return {
      type1,
      type2,
      ...moveCategories,
      ...scores,
      isPopular
    }
  }

  private analyzePokemonMoves(
    pokemon: any,
    combinationTypes: string[],
    moveCategories: Record<string, MoveInfo[]>
  ): void {
    const pokemonMoves = pokemon.moves || []

    for (const moveName of pokemonMoves) {
      const moveData = this.getMoveData(moveName)
      if (!moveData || moveData.category === 'Status') continue

      const effectiveness = this.getEffectiveness(moveData.type, combinationTypes)
      const moveInfo = this.createMoveInfo(moveData, pokemon, effectiveness)

      this.categorizeMove(moveCategories, moveInfo, effectiveness)
    }
  }

  private getMoveData(moveName: string): any {
    let moveData = this.moveCache.get(moveName)
    if (!moveData) {
      moveData = this.gen.moves.get(moveName)
      if (moveData) {
        this.moveCache.set(moveName, moveData)
      }
    }
    return moveData
  }

  private getSpeciesData(speciesName: string): any {
    let speciesData = this.speciesCache.get(speciesName)
    if (!speciesData) {
      speciesData = this.gen.species.get(speciesName)
      if (speciesData) {
        this.speciesCache.set(speciesName, speciesData)
      }
    }
    return speciesData
  }

  private getEffectiveness(moveType: string, targetTypes: string[]): number {
    const cacheKey = `${moveType}-${targetTypes.join(',')}`

    let effectiveness = this.effectivenessCache.get(cacheKey)
    if (effectiveness === undefined) {
      effectiveness = this.types.totalEffectiveness(moveType, targetTypes) || 1
      this.effectivenessCache.set(cacheKey, effectiveness as number)
    }

    return effectiveness as number
  }

  private createMoveInfo(moveData: any, pokemon: any, effectiveness: number): MoveInfo {
    const hasSTAB = pokemon.types?.includes(moveData.type) ?? false
    const isSpecial = moveData.category === 'Special'
    const attackStat = estimateAttackStat(pokemon, isSpecial)
    const damageScore = calculateDamageScore(
      moveData.basePower || 0,
      effectiveness,
      hasSTAB,
      attackStat
    )

    return {
      ...moveData,
      effectiveness,
      pokemon: pokemon.species,
      damageScore,
      hasSTAB
    }
  }

  private categorizeMove(
    moveCategories: Record<string, MoveInfo[]>,
    moveInfo: MoveInfo,
    effectiveness: number
  ): void {
    const isPhysical = moveInfo.category === 'Physical'
    const suffix = isPhysical ? 'Physical' : 'Special'

    if (effectiveness <= 0) {
      moveCategories[`immuneMoves${suffix}`].push(moveInfo)
    } else if (effectiveness < 1) {
      moveCategories[`resistantMoves${suffix}`].push(moveInfo)
    } else if (effectiveness === 1) {
      moveCategories[`neutralMoves${suffix}`].push(moveInfo)
    } else {
      moveCategories[`effectiveMoves${suffix}`].push(moveInfo)
    }
  }

  private sortAndLimitMoves(moveCategories: Record<string, MoveInfo[]>): void {
    const sortFn = (a: MoveInfo, b: MoveInfo) => b.damageScore - a.damageScore

    for (const category of Object.keys(moveCategories)) {
      moveCategories[category].sort(sortFn)
      moveCategories[category] = moveCategories[category].slice(0, MAX_MOVES_PER_CATEGORY)
    }
  }

  private calculateScores(moveCategories: Record<string, MoveInfo[]>): {
    level: CoverageLevel
    score: number
    levelPhysical: CoverageLevel
    scorePhysical: number
    levelSpecial: CoverageLevel
    scoreSpecial: number
  } {
    const calculateCategoryScore = (
      effective: MoveInfo[],
      neutral: MoveInfo[],
      resistant: MoveInfo[]
    ): { level: CoverageLevel; score: number } => {
      if (effective.length > 0) {
        const topMove = effective[0]
        return {
          level: 'Effective',
          score: effective.length * (topMove?.damageScore || 0)
        }
      } else if (neutral.length > 0) {
        const topMove = neutral[0]
        return {
          level: 'Neutral',
          score: neutral.length * (topMove?.damageScore || 0)
        }
      } else if (resistant.length > 0) {
        const topMove = resistant[0]
        return {
          level: 'Resistant',
          score: resistant.length * (topMove?.damageScore || 0)
        }
      } else {
        return { level: 'Immune', score: 0 }
      }
    }

    // 物理分数
    const physicalResult = calculateCategoryScore(
      moveCategories.effectiveMovesPhysical,
      moveCategories.neutralMovesPhysical,
      moveCategories.resistantMovesPhysical
    )

    // 特殊分数
    const specialResult = calculateCategoryScore(
      moveCategories.effectiveMovesSpecial,
      moveCategories.neutralMovesSpecial,
      moveCategories.resistantMovesSpecial
    )

    // 总体分数
    const allEffective = [
      ...moveCategories.effectiveMovesPhysical,
      ...moveCategories.effectiveMovesSpecial
    ]
    const allNeutral = [
      ...moveCategories.neutralMovesPhysical,
      ...moveCategories.neutralMovesSpecial
    ]
    const allResistant = [
      ...moveCategories.resistantMovesPhysical,
      ...moveCategories.resistantMovesSpecial
    ]

    const overallResult = calculateCategoryScore(allEffective, allNeutral, allResistant)

    return {
      level: overallResult.level,
      score: overallResult.score,
      levelPhysical: physicalResult.level,
      scorePhysical: physicalResult.score,
      levelSpecial: specialResult.level,
      scoreSpecial: specialResult.score
    }
  }

  private analyzePopularPokemonCoverage(team: Team): readonly PopularPokemonCoverage[] {
    const results = POPULAR_POKEMON.map(pokemonName => {
      const pokemonData = this.getSpeciesData(pokemonName)

      if (!pokemonData) {
        return this.createEmptyPokemonCoverage(pokemonName)
      }
      return this.analyzeSinglePokemonCoverage(team, pokemonName, pokemonData.types || [])
    })

    return results.sort((a, b) => b.overallScore - a.overallScore)
  }

  private analyzeSinglePokemonCoverage(
    team: Team,
    pokemonName: string,
    types: readonly string[]
  ): PopularPokemonCoverage {
    const bestMoves = {
      physical: [] as MoveInfo[],
      special: [] as MoveInfo[],
      overall: [] as MoveInfo[]
    }

    // 分析所有招式
    for (const pokemon of team.teamData || []) {
      const pokemonMoves = pokemon.moves || []

      for (const moveName of pokemonMoves) {
        const moveData = this.getMoveData(moveName)
        if (!moveData || moveData.category === 'Status') continue

        const effectiveness = this.getEffectiveness(moveData.type, Array.from(types))
        const moveInfo = this.createMoveInfo(moveData, pokemon, effectiveness)

        if (moveInfo.category === 'Physical') {
          bestMoves.physical.push(moveInfo)
        } else {
          bestMoves.special.push(moveInfo)
        }
        bestMoves.overall.push(moveInfo)
      }
    }

    // 排序并限制数量
    const sortFn = (a: MoveInfo, b: MoveInfo) => b.damageScore - a.damageScore
    bestMoves.physical.sort(sortFn)
    bestMoves.special.sort(sortFn)
    bestMoves.overall.sort(sortFn)

    bestMoves.physical = bestMoves.physical.slice(0, MAX_MOVES_PER_CATEGORY)
    bestMoves.special = bestMoves.special.slice(0, MAX_MOVES_PER_CATEGORY)
    bestMoves.overall = bestMoves.overall.slice(0, MAX_MOVES_PER_CATEGORY)

    // 确定覆盖等级和总分
    const topMove = bestMoves.overall[0]
    let coverageLevel: CoverageLevel = 'Immune'
    let overallScore = 0

    if (topMove) {
      if (topMove.effectiveness > 1) {
        coverageLevel = 'Effective'
      } else if (topMove.effectiveness === 1) {
        coverageLevel = 'Neutral'
      } else if (topMove.effectiveness > 0) {
        coverageLevel = 'Resistant'
      }
      overallScore = topMove.damageScore
    }

    return {
      pokemon: pokemonName,
      types: Array.from(types),
      bestMoves,
      coverageLevel,
      overallScore
    }
  }

  private createEmptyPokemonCoverage(pokemonName: string): PopularPokemonCoverage {
    return {
      pokemon: pokemonName,
      types: [],
      bestMoves: { physical: [], special: [], overall: [] },
      coverageLevel: 'Immune',
      overallScore: 0
    }
  }

  clearCache(): void {
    this.moveCache.clear()
    this.speciesCache.clear()
    this.effectivenessCache.clear()
  }
}

// ============================================================================
// 导出函数
// ============================================================================

export function createCoverageAnalyzer(generation: number = 9): CoverageAnalyzer {
  return new CoverageAnalyzer(generation)
}
