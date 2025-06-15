import { type PokemonSet } from '@pkmn/sets';

// ==================== 类型定义 ====================

export interface AbilityEffect {
  immunities?: string[];
  multipliers?: Record<string, number>;
}

export interface ItemEffect {
  immunities?: string[];
  multipliers?: Record<string, number>;
  specialHandling?: boolean;
}

// ==================== 常量定义 ====================

/**
 * 免疫特定属性攻击的特性映射
 */
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

/**
 * 特殊效果特性映射
 */
export const SPECIAL_ABILITIES: Record<string, Record<string, number>> = {
  'Dry Skin': {
    'Water': 0,    // 免疫水属性
    'Fire': 1.25,  // 火属性伤害增加
  },
} as const;

/**
 * 标靶道具的效果映射
 * 键为攻击属性，值为被移除免疫的防守属性
 */
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

/**
 * 道具效果映射
 */
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

/**
 * 天气效果映射
 */
export const WEATHER_EFFECTS: Record<string, Record<string, number>> = {
  'Rain': { 'Water': 1.5, 'Fire': 0.5 },                   // 水屬性招式的伤害×1.5; 火屬性招式的伤害×0.5
  'Heavy Rain': { 'Water': 1.5, 'Fire': 0 },               // 水屬性招式的威力×1.5, 火屬性攻击招式使用失败
  'Harsh Sunlight': { 'Fire': 1.5, 'Water': 0.5 },         // 火屬性招式的伤害×1.5, 水屬性招式的伤害×0.5
  'Extremely Harsh Sunlight': { 'Fire': 1.5, 'Water': 0 }, // 火屬性招式的威力×1.5, 水屬性攻击招式使用失败
  'Strong Winds': { 'Electric': 1, 'Ice': 1, 'Rock': 1 },  // 电屬性、冰屬性和岩石屬性招式不对飞行屬性效果修正为 x1
} as const;

/**
 * 场地效果映射
 */
export const TERRAIN_EFFECTS: Record<string, Record<string, number>> = {
  'Electric Terrain': { 'Electric': 1.3 }, // 地面上的寶可夢的電屬性招式威力x1.3
  'Grassy Terrain': { 'Grass': 1.3 },      // 地面上的寶可夢的草屬性招式威力x1.3
  'Misty Terrain': { 'Dragon': 0.5 },      // 地面上的宝可梦所受到的龙屬性招式的伤害×0.5
  'Psychic Terrain': { 'Psychic': 1.3 },   // 地面上的寶可夢的超能力屬性招式的威力x1.3
} as const;

// ==================== 辅助函数 ====================

/**
 * 判断宝可梦是否是地面上的宝可梦
 */
export function isOnTerrain(types: string[], ability: string, item: string): boolean {
  const isFlying = types.includes('Flying');
  const hasLevitate = ability === 'Levitate';
  const hasAirBalloon = item === 'Air Balloon';
  const hasIronBall = item === 'Iron Ball';

  return (!isFlying && !hasLevitate && !hasAirBalloon) || hasIronBall;
}

/**
 * 检查特性是否对特定属性免疫
 */
export function isAbilityImmune(ability: string | undefined, attackType: string): boolean {
  if (!ability) return false;
  return IMMUNITY_ABILITIES[ability]?.includes(attackType) ?? false;
}

/**
 * 获取特性对特定属性的倍率修正
 */
export function getAbilityMultiplier(ability: string | undefined, attackType: string): number {
  if (!ability) return 1;

  // 检查免疫特性
  if (isAbilityImmune(ability, attackType)) {
    return 0;
  }

  // 检查特殊效果特性
  const specialEffect = SPECIAL_ABILITIES[ability];
  if (specialEffect && attackType in specialEffect) {
    return specialEffect[attackType];
  }

  return 1;
}

/**
 * 检查道具是否对特定属性免疫
 */
export function isItemImmune(item: string | undefined, attackType: string): boolean {
  if (!item) return false;
  const itemEffect = ITEM_EFFECTS[item];
  return itemEffect?.immunities?.includes(attackType) ?? false;
}

/**
 * 获取道具对特定属性的倍率修正
 */
export function getItemMultiplier(item: string | undefined, attackType: string): number {
  if (!item) return 1;

  // 检查免疫效果
  if (isItemImmune(item, attackType)) {
    return 0;
  }

  // 检查倍率修正
  const itemEffect = ITEM_EFFECTS[item];
  if (itemEffect?.multipliers && attackType in itemEffect.multipliers) {
    return itemEffect.multipliers[attackType];
  }

  return 1;
}

/**
 * 检查道具是否需要特殊处理
 */
export function needsSpecialHandling(item: string | undefined): boolean {
  if (!item) return false;
  return ITEM_EFFECTS[item]?.specialHandling ?? false;
}

/**
 * 过滤掉指定的属性类型
 */
export function filterTypes(types: string[], typeToRemove: string): string[] {
  return types.filter(type => type !== typeToRemove);
}

/**
 * 验证宝可梦数据的完整性
 */
export function validatePokemonData(pokemon: PokemonSet | Partial<PokemonSet>): boolean {
  return !!(pokemon.species);
}

/**
 * 获取宝可梦的显示名称
 */
export function getPokemonDisplayName(pokemon: PokemonSet | Partial<PokemonSet>): string {
  return pokemon.name || pokemon.species || 'Unknown';
}

/**
 * 检查宝可梦是否具有指定属性
 */
export function hasType(pokemonTypes: string[], targetType: string): boolean {
  return pokemonTypes.includes(targetType);
}

/**
 * 格式化抗性倍率为可读字符串
 */
export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0) return '免疫';
  if (multiplier === 0.25) return '1/4倍';
  if (multiplier === 0.5) return '1/2倍';
  if (multiplier === 1) return '正常';
  if (multiplier === 2) return '2倍';
  if (multiplier === 4) return '4倍';
  return `${multiplier}倍`;
}

/**
 * 获取抗性等级描述
 */
export function getResistanceLevel(multiplier: number): string {
  if (multiplier === 0) return '免疫';
  if (multiplier <= 0.5) return '抗性';
  if (multiplier === 1) return '普通';
  if (multiplier >= 2) return '弱点';
  return '普通';
}

/**
 * 获取天气对特定属性的倍率修正
 */
export function getWeatherMultiplier(weather: string, attackType: string): number {
  if (!weather) return 1;
  return WEATHER_EFFECTS[weather][attackType] ?? 1;
}
