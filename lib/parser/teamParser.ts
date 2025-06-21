import { Dex } from '@pkmn/dex'
import { Generations, Moves, type Move, type Specie } from '@pkmn/data'
import { type PokemonSet } from '@pkmn/sets'
import { Dex as SimDex, Teams, TeamValidator } from '@pkmn/sim'

import { calculateStats } from '../calculator/statsCalculator'
import idMapping from '~/data/pokemon-id-mapping.json'
import { initializeFormats } from './formatInitializer'
import { normalizeName } from '~/utils/teamUtils'
import { DEFAULT_BASE_STATS, DEFAULT_GAME_VERSION, DEFAULT_LEVEL, DEFAULT_STATS, GENERATION_MAP } from '../core/defaults'
import { CACHE_KEYS, CACHE_TTL } from '../core/constants'
import type { Pokemon } from '../core/types'
import { cacheService } from '../core/cacheService'

// ==================== 缓存和常量 ====================

// 类型映射缓存 (避免重复类型转换)
const idMappingCache = idMapping as Record<string, number>

// ==================== 工具函数 ====================

/**
 * 获取缓存的世代数据
 */
function getCachedGeneration(genNum: number = GENERATION_MAP[DEFAULT_GAME_VERSION]) {
  const cacheKey = CACHE_KEYS.GENERATION(genNum)

  let generation = cacheService.get<ReturnType<Generations['get']>>(cacheKey)
  if (!generation) {
    generation = new Generations(Dex).get(genNum)
    // 长期缓存世代数据
    cacheService.set(cacheKey, generation, CACHE_TTL.LONG)
  }

  return generation
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
  genNum: number = GENERATION_MAP[DEFAULT_GAME_VERSION]
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
    const validator = new TeamValidator(rule, SimDex)
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
 * 补充队伍信息
 */
function completeTeam(teamParsed: PokemonSet<string>[], genNum: number): Pokemon[] {
  const gen = getCachedGeneration(genNum)
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
    pokeApiNum: getPokeApiNum(pkm.species, specie?.num || 0),
    movesDetails: movesDetails,
  }
}

/**
 * 获取 PokeAPI 编号
 */
function getPokeApiNum(name: string, nationalId: number): number {
  const pokemonName = normalizeName(name)

  // 直接使用缓存的映射，避免重复类型转换
  return idMappingCache[pokemonName] ?? nationalId
}

// ==================== 缓存清理 ====================

/**
 * 清理缓存 (调试用/内存管理)
 */
export function clearParserCache(): void {
  // 清理所有 generation 相关的缓存
  const generationKeys = Array.from({ length: 9 }, (_, i) => CACHE_KEYS.GENERATION(i + 1))
  generationKeys.forEach(key => cacheService.delete(key))
}
