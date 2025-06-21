import type { NatureEffect } from './types'

// ==================== Game Configuration ====================

export const DEFAULT_GAME_VERSION = 'sv'
export const DEFAULT_GENERATION = 9
export const DEFAULT_LEVEL = 50
export const DEFAULT_NATURE = 'Hardy'

// 世代映射
export const GENERATION_MAP: Record<string, number> = {
  'sv': 9,
} as const

// ==================== Default Stats ====================

export const DEFAULT_BASE_STATS = {
  hp: 100,
  atk: 100,
  def: 100,
  spa: 100,
  spd: 100,
  spe: 100
} as const

export const DEFAULT_IVS = {
  hp: 31,
  atk: 31,
  def: 31,
  spa: 31,
  spd: 31,
  spe: 31
} as const

export const DEFAULT_EVS = {
  hp: 0,
  atk: 0,
  def: 0,
  spa: 0,
  spd: 0,
  spe: 0
} as const

export const DEFAULT_STATS = {
  hp: 175,
  atk: 120,
  def: 120,
  spa: 120,
  spd: 120,
  spe: 120
} as const

// ==================== Nature System ====================

// 性格修正值
export const NATURE_BOOST = 1.1 as const
export const NATURE_REDUCTION = 0.9 as const
export const NATURE_NEUTRAL = 1.0 as const

// 性格效果映射
export const NATURE_MODIFIERS: Record<string, NatureEffect> = {
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

// ==================== Cache Configuration ====================

// Cache TTL 常量 (毫秒)
export const CACHE_TTL = {
  // 静态数据 (24小时) - 游戏数据不会改变
  STATIC: 24 * 60 * 60 * 1000,

  // 长期缓存 (1小时) - 世代数据等
  LONG: 60 * 60 * 1000,

  // 中期缓存 (30分钟) - 计算结果等
  MEDIUM: 30 * 60 * 1000,

  // 短期缓存 (5分钟) - 临时数据
  SHORT: 5 * 60 * 1000,

  // 用户会话 (2小时) - 用户相关数据
  SESSION: 2 * 60 * 60 * 1000,
} as const

// Cache Key 生成器
export const CACHE_KEYS = {
  // ==================== Core Data ====================
  GENERATION: (genNum: number) => `gen:${genNum}`,
} as const

// Cache Manager 配置
export const CACHE_MANAGER_CONFIG = {
  // 版本控制
  CURRENT_VERSION: '1.0.0',

  // 容量限制
  MAX_CACHE_SIZE: 1000,

  // 维护配置
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5分钟
  COMPRESSION_THRESHOLD: 1024, // 1KB
} as const

// ==================== Health Monitoring ====================

// 健康检查阈值
export const CACHE_HEALTH_THRESHOLDS = {
  // 性能指标
  HIT_RATE_WARNING: 50,      // 命中率低于50%时警告

  // 资源使用
  MEMORY_CRITICAL: 50000,    // 内存使用超过50MB时严重警告
} as const
