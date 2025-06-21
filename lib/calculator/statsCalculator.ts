import type { StatsTable } from '@pkmn/types'
import type { StatKey, NatureModifier } from '~/lib/core/types'
import {
  NATURE_MODIFIERS,
  NATURE_BOOST,
  NATURE_REDUCTION,
  NATURE_NEUTRAL,
  CACHE_KEYS,
  CACHE_TTL
} from '~/lib/core/constants'
import { DEFAULT_BASE_STATS, DEFAULT_IVS, DEFAULT_EVS } from '~/lib/core/constants'
import { cacheService } from '~/lib/core/cacheService'

// ==================== 辅助函数 ====================

/**
 * 安全地获取属性值，提供默认值
 */
function safeGetStatValue(stats: Partial<StatsTable> | undefined, key: keyof StatsTable, defaultValue: number): number {
  return stats?.[key] ?? defaultValue
}

/**
 * 标准化 StatsTable，确保所有字段都有值
 */
function normalizeStatsTable(stats: Partial<StatsTable> | undefined, defaults: StatsTable): StatsTable {
  return {
    hp: safeGetStatValue(stats, 'hp', defaults.hp),
    atk: safeGetStatValue(stats, 'atk', defaults.atk),
    def: safeGetStatValue(stats, 'def', defaults.def),
    spa: safeGetStatValue(stats, 'spa', defaults.spa),
    spd: safeGetStatValue(stats, 'spd', defaults.spd),
    spe: safeGetStatValue(stats, 'spe', defaults.spe)
  }
}

/**
 * 获取性格对特定属性的修正值
 */
function getNatureModifier(nature: string, stat: StatKey): NatureModifier {
  const natureEffect = NATURE_MODIFIERS[nature]

  if (!natureEffect) {
    console.warn(`Unknown nature: ${nature}, using neutral modifier`)
    return NATURE_NEUTRAL
  }

  if (natureEffect.increased === stat) return NATURE_BOOST
  if (natureEffect.decreased === stat) return NATURE_REDUCTION
  return NATURE_NEUTRAL
}

/**
 * 计算HP值 (特殊公式)
 */
function calculateHP(baseHP: number, ivHP: number, evHP: number, level: number): number {
  return Math.floor(Math.floor(baseHP * 2 + ivHP + evHP / 4) * level / 100 + 10 + level)
}

/**
 * 计算非HP属性值
 */
function calculateStat(base: number, iv: number, ev: number, level: number, natureModifier: NatureModifier): number {
  return Math.floor((Math.floor(base * 2 + iv + ev / 4) * level / 100 + 5) * natureModifier)
}

/**
 * 生成缓存键
 */
function generateStatsCacheKey(
  baseStats: StatsTable,
  ivs: StatsTable,
  evs: StatsTable,
  level: number,
  nature: string
): string {
  // 创建简化的哈希以减少键长度
  const baseHash = JSON.stringify(baseStats)
  const ivsHash = JSON.stringify(ivs)
  const evsHash = JSON.stringify(evs)
  const combinedHash = `${baseHash}-${ivsHash}-${evsHash}-${level}-${nature}`

  // 使用简单的哈希函数
  let hash = 0
  for (let i = 0; i < combinedHash.length; i++) {
    const char = combinedHash.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }

  return CACHE_KEYS.POKEMON_STATS(Math.abs(hash).toString())
}

// ==================== 主要函数 ====================

/**
 * 计算宝可梦的完整属性值
 * @param baseStats - 宝可梦的种族值 (可能为 undefined)
 * @param ivs - 个体值 (可能为 undefined)
 * @param evs - 努力值 (可能为 undefined)
 * @param level - 等级
 * @param nature - 性格 (可能为 undefined)
 * @returns 计算后的属性值
 */
export function calculateStats(
  baseStats: Partial<StatsTable> | undefined,
  ivs: Partial<StatsTable> | undefined,
  evs: Partial<StatsTable> | undefined,
  level: number,
  nature?: string
): StatsTable {
  // 参数验证和标准化
  if (level < 1 || level > 100) {
    throw new Error(`Invalid level: ${level}. Level must be between 1 and 100.`)
  }

  // 标准化输入参数
  const normalizedBaseStats = normalizeStatsTable(baseStats, DEFAULT_BASE_STATS)
  const normalizedIvs = normalizeStatsTable(ivs, DEFAULT_IVS)
  const normalizedEvs = normalizeStatsTable(evs, DEFAULT_EVS)
  const normalizedNature = nature || 'Hardy'

  // 如果原始数据无效，记录警告
  if (!baseStats) {
    console.warn('BaseStats is undefined, using default values')
  }

  // 检查缓存
  const cacheKey = generateStatsCacheKey(normalizedBaseStats, normalizedIvs, normalizedEvs, level, normalizedNature)
  const cached = cacheService.get<StatsTable>(cacheKey)
  if (cached) {
    return cached
  }

  // 计算各项属性
  const stats: StatsTable = {
    hp: calculateHP(normalizedBaseStats.hp, normalizedIvs.hp, normalizedEvs.hp, level),
    atk: calculateStat(normalizedBaseStats.atk, normalizedIvs.atk, normalizedEvs.atk, level, getNatureModifier(normalizedNature, 'atk')),
    def: calculateStat(normalizedBaseStats.def, normalizedIvs.def, normalizedEvs.def, level, getNatureModifier(normalizedNature, 'def')),
    spa: calculateStat(normalizedBaseStats.spa, normalizedIvs.spa, normalizedEvs.spa, level, getNatureModifier(normalizedNature, 'spa')),
    spd: calculateStat(normalizedBaseStats.spd, normalizedIvs.spd, normalizedEvs.spd, level, getNatureModifier(normalizedNature, 'spd')),
    spe: calculateStat(normalizedBaseStats.spe, normalizedIvs.spe, normalizedEvs.spe, level, getNatureModifier(normalizedNature, 'spe'))
  }

  // 缓存结果 (中期缓存，30分钟过期)
  cacheService.set(cacheKey, stats, CACHE_TTL.MEDIUM)

  return stats
}

// ==================== 工具函数 ====================

/**
 * 清理属性计算相关的缓存
 */
export function clearStatsCache(): void {
  // 清理所有属性计算相关的缓存
  const pattern = /^pokemon_stats:/
  const deletedCount = cacheService.clearByPattern(pattern)
  console.log(`Cleared ${deletedCount} stats cache entries`)
}

/**
 * 获取属性计算缓存的统计信息
 */
export function getStatsCacheInfo(): { message: string } {
  const stats = cacheService.getCacheStats()
  return {
    message: `Total cache entries: ${stats.general.totalEntries}, Memory usage: ${stats.general.memoryUsage}, Hit rate: ${stats.general.hitRate}%`
  }
}
