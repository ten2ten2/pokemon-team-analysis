// lib/calculator/statsCalculator.ts - 优化后的版本

import type { StatsTable } from '@pkmn/types'

// ==================== 类型定义 ====================

type StatKey = 'atk' | 'def' | 'spa' | 'spd' | 'spe'
type NatureModifier = 1.1 | 1.0 | 0.9

interface NatureEffect {
  readonly increased?: StatKey
  readonly decreased?: StatKey
}

// ==================== 常量定义 ====================

// 默认种族值 (当无法获取真实数据时使用)
const DEFAULT_BASE_STATS: StatsTable = {
  hp: 100,
  atk: 100,
  def: 100,
  spa: 100,
  spd: 100,
  spe: 100
} as const

// 默认个体值
const DEFAULT_IVS: StatsTable = {
  hp: 31,
  atk: 31,
  def: 31,
  spa: 31,
  spd: 31,
  spe: 31
} as const

// 默认努力值
const DEFAULT_EVS: StatsTable = {
  hp: 0,
  atk: 0,
  def: 0,
  spa: 0,
  spd: 0,
  spe: 0
} as const

// 性格效果映射
const NATURE_MODIFIERS: Record<string, NatureEffect> = {
  // +攻击
  'Lonely': { increased: 'atk', decreased: 'def' },
  'Adamant': { increased: 'atk', decreased: 'spa' },
  'Naughty': { increased: 'atk', decreased: 'spd' },
  'Brave': { increased: 'atk', decreased: 'spe' },
  // +防御
  'Bold': { increased: 'def', decreased: 'atk' },
  'Impish': { increased: 'def', decreased: 'spa' },
  'Lax': { increased: 'def', decreased: 'spd' },
  'Relaxed': { increased: 'def', decreased: 'spe' },
  // +特攻
  'Modest': { increased: 'spa', decreased: 'atk' },
  'Mild': { increased: 'spa', decreased: 'def' },
  'Rash': { increased: 'spa', decreased: 'spd' },
  'Quiet': { increased: 'spa', decreased: 'spe' },
  // +特防
  'Calm': { increased: 'spd', decreased: 'atk' },
  'Gentle': { increased: 'spd', decreased: 'def' },
  'Careful': { increased: 'spd', decreased: 'spa' },
  'Sassy': { increased: 'spd', decreased: 'spe' },
  // +速度
  'Timid': { increased: 'spe', decreased: 'atk' },
  'Hasty': { increased: 'spe', decreased: 'def' },
  'Jolly': { increased: 'spe', decreased: 'spa' },
  'Naive': { increased: 'spe', decreased: 'spd' },
  // 中性 (无修正)
  'Hardy': {},
  'Docile': {},
  'Bashful': {},
  'Quirky': {},
  'Serious': {}
} as const

// 性格修正值
const NATURE_BOOST = 1.1 as const
const NATURE_REDUCTION = 0.9 as const
const NATURE_NEUTRAL = 1.0 as const

// 缓存计算结果
const statsCache = new Map<string, StatsTable>()

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
function generateCacheKey(
  baseStats: StatsTable,
  ivs: StatsTable,
  evs: StatsTable,
  level: number,
  nature: string
): string {
  return `${JSON.stringify(baseStats)}-${JSON.stringify(ivs)}-${JSON.stringify(evs)}-${level}-${nature}`
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
  const cacheKey = generateCacheKey(normalizedBaseStats, normalizedIvs, normalizedEvs, level, normalizedNature)
  const cached = statsCache.get(cacheKey)
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

  // 缓存结果
  statsCache.set(cacheKey, stats)

  return stats
}

/**
 * 清除缓存 (调试用/可选的性能优化函数)
 */
export function clearStatsCache(): void {
  statsCache.clear()
}

/**
 * 获取缓存统计信息 (调试用)
 */
export function getStatsCacheInfo(): { size: number; keys: string[] } {
  return {
    size: statsCache.size,
    keys: Array.from(statsCache.keys())
  }
}
