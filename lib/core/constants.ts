import type { NatureEffect, ItemEffect } from '~/lib/core/types'

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

export const STAB_MULTIPLIER = 1.5 as const

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

// 健康检查阈值
export const CACHE_HEALTH_THRESHOLDS = {
  // 性能指标
  HIT_RATE_WARNING: 50,      // 命中率低于50%时警告

  // 资源使用
  MEMORY_CRITICAL: 50000,    // 内存使用超过50MB时严重警告
} as const

// ==================== Resistance Analysis ====================

// 免疫特定属性攻击的特性映射
export const IMMUNITY_ABILITIES: Record<string, string[]> = {
  'Levitate': ['Ground'],
  'Volt Absorb': ['Electric'],
  'Motor Drive': ['Electric'],
  'Lightning Rod': ['Electric'],
  'Storm Drain': ['Water'],
  'Water Absorb': ['Water'],
  'Flash Fire': ['Fire'],
  'Well-Baked Body': ['Fire'],
  'Sap Sipper': ['Grass'],
  'Earth Eater': ['Ground'],
} as const;

// 特殊效果特性映射
export const SPECIAL_ABILITIES: Record<string, Record<string, number>> = {
  'Dry Skin': {
    'Water': 0,    // 免疫水属性
    'Fire': 1.25,  // 火属性伤害增加
  },
} as const;

// 标靶道具的效果映射
// 键为攻击属性，值为被移除免疫的防守属性
export const RING_TARGET_EFFECTS: Record<string, string> = {
  'Psychic': 'Dark',    // 恶属性宝可梦可以被超能力属性招式命中
  'Poison': 'Steel',    // 钢属性宝可梦可以被毒属性招式命中
  'Fighting': 'Ghost',  // 幽灵属性宝可梦可以被格斗属性招式命中
  'Normal': 'Ghost',    // 幽灵属性宝可梦可以被一般属性招式命中
  'Ghost': 'Normal',    // 一般属性宝可梦可以被幽灵属性招式命中
  'Electric': 'Ground', // 地面属性宝可梦可以被电属性招式命中
  'Dragon': 'Fairy',    // 妖精属性宝可梦可以被龙属性招式命中
  'Ground': 'Flying',   // 飞行属性宝可梦可以被地面属性招式命中
} as const;

// 道具效果映射
export const ITEM_EFFECTS: Record<string, ItemEffect> = {
  'Air Balloon': {
    immunities: ['Ground'],
  },
  'Iron Ball': {
    specialHandling: true,
  },
  'Ring Target': {
    specialHandling: true,
  },
} as const;

// 天气效果映射
export const WEATHER_EFFECTS: Record<string, Record<string, number>> = {
  'Rain': { 'Water': 1.5, 'Fire': 0.5 },                   // 水屬性招式的伤害×1.5; 火屬性招式的伤害×0.5
  // 'Heavy Rain': { 'Water': 1.5, 'Fire': 0 },               // 水屬性招式的威力×1.5, 火屬性攻击招式使用失败
  'Harsh Sunlight': { 'Fire': 1.5, 'Water': 0.5 },         // 火屬性招式的伤害×1.5, 水屬性招式的伤害×0.5
  // 'Extremely Harsh Sunlight': { 'Fire': 1.5, 'Water': 0 }, // 火屬性招式的威力×1.5, 水屬性攻击招式使用失败
  // 'Strong Winds': { 'Electric': 1, 'Ice': 1, 'Rock': 1 },  // 电屬性、冰屬性和岩石屬性招式不对飞行屬性效果修正为 x1
} as const;

// 场地效果映射
export const TERRAIN_EFFECTS: Record<string, Record<string, number>> = {
  'Electric Terrain': { 'Electric': 1.3 }, // 如果攻击方为地面上的寶可夢, 電屬性招式威力x1.3
  'Grassy Terrain': { 'Grass': 1.3 },      // 如果攻击方为地面上的寶可夢, 草屬性招式威力x1.3
  'Misty Terrain': { 'Dragon': 0.5 },      // 地面上的宝可梦所受到的龙屬性招式的伤害×0.5
  'Psychic Terrain': { 'Psychic': 1.3 },   // 如果攻击方为地面上的寶可夢, 超能力屬性招式的威力x1.3
} as const;

// 场地特定的属性映射
export const TERRIAN_TYPES: Record<string, { baseType: string; terrainType: string }> = {
  'Electric Terrain': { baseType: 'Electric', terrainType: 'Electric (Grounded)' },
  'Grassy Terrain': { baseType: 'Grass', terrainType: 'Grass (Grounded)' },
  'Psychic Terrain': { baseType: 'Psychic', terrainType: 'Psychic (Grounded)' },
} as const;
