import type { ItemEffect } from './types'

// ==================== Game Configuration ====================

export const DEFAULT_GENERATION = 9
export const DEFAULT_LEVEL = 50

// Default values for omitted Showdown fields.


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


export const STAB_MULTIPLIER = 1.5 as const

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
export const TERRAIN_TYPES: Record<string, { baseType: string; terrainType: string }> = {
  'Electric Terrain': { baseType: 'Electric', terrainType: 'Electric (Grounded)' },
  'Grassy Terrain': { baseType: 'Grass', terrainType: 'Grass (Grounded)' },
  'Psychic Terrain': { baseType: 'Psychic', terrainType: 'Psychic (Grounded)' },
} as const;

// ==================== Popular Pokémon ====================

export const POPULAR_POKEMON: string[] = [
  'Incineroar', 'Miraidon', 'Calyrex-Ice', 'Rillaboom', 'Urshifu-Rapid-Strike',
  'Calyrex-Shadow', 'Zamazenta-Crown-Shield', 'Kyogre', 'Grimmsnarl',
  'Amoonguss', 'Lunala', 'Tornadus-Incarnate', 'Indedede-F', 'Chien-Pao',
]
