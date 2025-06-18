/**
 * 获取宝可梦属性对应的CSS类名
 * @param type 属性名称（英文）
 * @param variant 样式变体：'default' 为深色背景，'light' 为浅色背景
 * @returns CSS类名字符串
 */
export function getTypeClass(type: string, variant: 'default' | 'light' = 'default'): string {
  const normalizedType = type.toLowerCase().replace(/[^a-z]/g, '')
  const suffix = variant === 'light' ? '-light' : ''

  // 属性映射表
  const typeMap: Record<string, string> = {
    normal: 'normal',
    fighting: 'fighting',
    flying: 'flying',
    poison: 'poison',
    ground: 'ground',
    rock: 'rock',
    bug: 'bug',
    ghost: 'ghost',
    steel: 'steel',
    fire: 'fire',
    water: 'water',
    grass: 'grass',
    electric: 'electric',
    psychic: 'psychic',
    ice: 'ice',
    dragon: 'dragon',
    dark: 'dark',
    fairy: 'fairy'
  }

  const mappedType = typeMap[normalizedType] || 'normal'
  return `type-${mappedType}${suffix}`
}

/**
 * 获取属性图标的CSS类名
 * @param type 属性名称（英文）
 * @returns 属性图标的CSS类名字符串
 */
export function getTypeIconClass(type: string): string {
  const normalizedType = type.toLowerCase().replace(/[^a-z]/g, '')

  // 属性映射表
  const typeMap: Record<string, string> = {
    normal: 'normal',
    fighting: 'fighting',
    flying: 'flying',
    poison: 'poison',
    ground: 'ground',
    rock: 'rock',
    bug: 'bug',
    ghost: 'ghost',
    steel: 'steel',
    fire: 'fire',
    water: 'water',
    grass: 'grass',
    electric: 'electric',
    psychic: 'psychic',
    ice: 'ice',
    dragon: 'dragon',
    dark: 'dark',
    fairy: 'fairy'
  }

  const mappedType = typeMap[normalizedType] || 'normal'
  return `sprite-type sprite-type-${mappedType}`
}

/**
 * 获取技能分类图标的CSS类名
 * @param category 技能分类名称（英文）
 * @returns 技能分类图标的CSS类名字符串
 */
export function getMoveCategoryIconClass(category: string): string {
  const normalizedCategory = category.toLowerCase().replace(/[^a-z]/g, '')
  return `sprite-category sprite-category-${normalizedCategory}`
}

/**
 * 获取完整的属性标签类名（包含基础样式）
 * @param type 属性名称
 * @param variant 样式变体
 * @returns 完整的CSS类名字符串
 */
export function getTypeBadgeClass(type: string, variant: 'default' | 'light' = 'default'): string {
  return `pokemon-type-badge ${getTypeClass(type, variant)}`
}

/**
 * 获取完整的属性芯片类名（用于技能等）
 * @param type 属性名称
 * @param variant 样式变体
 * @returns 完整的CSS类名字符串
 */
export function getTypeChipClass(type: string, variant: 'default' | 'light' = 'default'): string {
  return `pokemon-type-chip ${getTypeClass(type, variant)}`
}
