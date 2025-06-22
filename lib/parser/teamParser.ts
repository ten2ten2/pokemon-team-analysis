/**
 * 队伍解析器
 * 负责解析用户输入的队伍字符串，并转换为标准的 Pokemon 对象数组
 */

// 外部依赖
import { Dex, Teams, TeamValidator } from '@pkmn/sim'
import { type PokemonSet } from '@pkmn/sets'
import { Moves, type Move, type Specie } from '@pkmn/data'

// 常量和类型
import {
  DEFAULT_BASE_STATS,
  DEFAULT_GENERATION,
  DEFAULT_LEVEL,
  DEFAULT_STATS
} from '~/lib/core/constants'
import type { Pokemon } from '~/lib/core/types'

// 项目数据
import idMapping from '~/lib/data/pokemon-id-mapping.json'

// 项目工具和服务
import { normalizeName } from '~/lib/core/utils'
import { initializeFormats } from '~/lib/core/formats/formatInitializer'
import { dataService } from '~/lib/core/dataService'
import { calculateStats } from '~/lib/calculator/statsCalculator'

// ==================== 静态数据缓存 ====================

// PokeAPI ID 映射表 - 静态数据，懒加载，无需动态缓存管理
// 直接内存访问，保证最佳性能
let idMappingCache: Record<string, number> | null = null

// ==================== 辅助函数 ====================

/**
 * 获取 PokeAPI ID 映射表
 */
function getIdMappingCache(): Record<string, number> {
  if (!idMappingCache) {
    idMappingCache = idMapping as Record<string, number>
  }
  return idMappingCache
}

/**
 * 获取 PokeAPI 编号
 */
export function getPokeApiNum(name: string, nationalId?: number): number {
  const pokemonName = normalizeName(name)
  // 直接使用缓存的映射，避免重复类型转换
  return getIdMappingCache()[pokemonName] ?? nationalId
}

/**
 * 补充单个宝可梦信息
 */
function completeSinglePokemon(pkm: PokemonSet, specie: Specie, moves: Moves): Pokemon {
  // 安全获取必要数据
  const types = specie.types ?? []
  const baseStats = specie.baseStats

  // 验证必要数据
  if (!baseStats) {
    console.warn(`Missing baseStats for ${pkm.species}, using default values`)
  }

  // 批量处理招式详情
  const movesDetails = pkm.moves.reduce((acc, move) => {
    const moveDetail = moves.get(move)
    if (moveDetail) {
      acc[move] = moveDetail
    } else {
      console.warn(`Move not found: ${move}`)
    }
    return acc
  }, {} as Record<string, Move>)

  // 安全计算种族值 (添加错误处理)
  let calculatedStats
  try {
    calculatedStats = calculateStats(baseStats, pkm.ivs, pkm.evs, pkm.level || DEFAULT_LEVEL, pkm.nature)
  } catch (error) {
    console.error(`Stats calculation failed for ${pkm.species}:`, error)
    // 使用默认值或基础值
    calculatedStats = baseStats || DEFAULT_STATS
  }

  return {
    ...pkm,
    species: pkm.species,
    baseStats: baseStats || DEFAULT_BASE_STATS,
    stats: calculatedStats,
    types: types,
    pokeApiNum: getPokeApiNum(pkm.species, specie?.num),
    movesDetails: movesDetails,
  }
}

/**
 * 补充队伍信息
 */
function completeTeam(teamParsed: PokemonSet<string>[], genNum: number): Pokemon[] {
  const gen = dataService.getGeneration(genNum)
  const moves = gen.moves

  // 批量获取所有物种数据
  const teamSpecies = teamParsed.map(pkm => {
    const specie = gen.species.get(pkm.species)
    if (!specie) {
      console.warn(`Species not found: ${pkm.species}`)
    }
    return specie
  })

  // 并行处理每个宝可梦
  return teamParsed.map((pkm, index) => {
    const specie = teamSpecies[index]
    if (!specie) {
      throw new Error(`Failed to find species data for: ${pkm.species}`)
    }
    return completeSinglePokemon(pkm, specie, moves)
  })
}

// ==================== 主要函数 ====================

/**
 * 解析队伍并验证队伍是否符合规则
 * @param teamRawString - 原始队伍字符串
 * @param rule - 规则字符串
 * @param genNum - 世代号
 * @returns 解析结果
 */
export function parseAndValidateTeam(
  teamRawString: string,
  rule: string,
  genNum: number = DEFAULT_GENERATION
): { teamParsed: Pokemon[], errors: string[] } {
  try {
    // 确保格式已正确初始化 (幂等操作)
    initializeFormats()

    // 解析队伍数据
    const teamParsed = Teams.import(teamRawString)
    if (!teamParsed || !Array.isArray(teamParsed) || teamParsed.length === 0) {
      return { teamParsed: [], errors: ['Invalid team data format'] }
    }

    // 创建深拷贝以避免 validateTeam 修改原始数据
    const teamForValidation = JSON.parse(JSON.stringify(teamParsed))

    // 验证队伍规则
    const validator = new TeamValidator(rule, Dex)
    const validationResult = validator.validateTeam(teamForValidation)

    const errors: string[] = []
    if (validationResult && validationResult.length > 0) {
      errors.push(...validationResult)
    }

    // 使用原始数据进行补充处理
    const completedTeam = completeTeam(teamParsed as PokemonSet<string>[], genNum)
    return { teamParsed: completedTeam, errors }

  } catch (error) {
    console.error('Team parsing failed:', error)
    return {
      teamParsed: [],
      errors: [`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

/**
 * 解析队伍，不进行验证
 * @param teamRawString - 原始队伍字符串
 * @param genNum - 世代号
 * @returns 解析结果
 */
export function parseTeam(teamRawString: string, genNum: number = DEFAULT_GENERATION): Pokemon[] {
  // 解析队伍数据
  const teamParsed = Teams.import(teamRawString)
  // 使用原始数据进行补充处理
  const completedTeam = completeTeam(teamParsed as PokemonSet<string>[], genNum)
  return completedTeam
}
