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
    fairy: 'fairy',
    stellar: 'stellar'
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
    fairy: 'fairy',
    stellar: 'stellar'
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

/**
 * 获取太晶化属性对应的CSS类名
 * @param type 属性名称（英文）
 * @param variant 样式变体：'default' 为深色背景，'light' 为浅色背景
 * @returns CSS类名字符串
 */
export function getTeraTypeClass(type: string, variant: 'default' | 'light' = 'default'): string {
  const normalizedType = type.toLowerCase().replace(/[^a-z]/g, '')
  const suffix = variant === 'light' ? '-light' : ''

  // 太晶化星晶使用特殊颜色，其他太晶化属性使用白色背景
  if (normalizedType === 'stellar') {
    return `type-tera-stellar${suffix}`
  }

  return `type-tera${suffix}`
}

/**
 * 获取太晶化属性图标的CSS类名
 * @param type 属性名称（英文）
 * @returns 太晶化属性图标的CSS类名字符串
 */
export function getTeraTypeIconClass(type: string): string {
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
    fairy: 'fairy',
    stellar: 'stellar'
  }

  const mappedType = typeMap[normalizedType] || 'normal'
  return `sprite-type sprite-type-tera-${mappedType}`
}

/**
 * 获取完整的太晶化属性标签类名（包含基础样式）
 * @param type 属性名称
 * @param variant 样式变体
 * @returns 完整的CSS类名字符串
 */
export function getTeraTypeBadgeClass(type: string, variant: 'default' | 'light' = 'default'): string {
  return `pokemon-type-badge ${getTeraTypeClass(type, variant)}`
}

/**
 * 获取完整的太晶化属性芯片类名
 * @param type 属性名称
 * @param variant 样式变体
 * @returns 完整的CSS类名字符串
 */
export function getTeraTypeChipClass(type: string, variant: 'default' | 'light' = 'default'): string {
  return `pokemon-type-chip ${getTeraTypeClass(type, variant)}`
}

/**
 * 根据是否太晶化获取属性类名
 * @param type 属性名称
 * @param isTerastallized 是否太晶化
 * @param variant 样式变体
 * @returns CSS类名字符串
 */
export function getTypeClassByTeraStatus(
  type: string,
  isTerastallized: boolean = false,
  variant: 'default' | 'light' = 'default'
): string {
  return isTerastallized ? getTeraTypeClass(type, variant) : getTypeClass(type, variant)
}

/**
 * 根据是否太晶化获取属性图标类名
 * @param type 属性名称
 * @param isTerastallized 是否太晶化
 * @returns 属性图标的CSS类名字符串
 */
export function getTypeIconClassByTeraStatus(type: string, isTerastallized: boolean = false): string {
  return isTerastallized ? getTeraTypeIconClass(type) : getTypeIconClass(type)
}

/**
 * 根据是否太晶化获取完整的属性标签类名
 * @param type 属性名称
 * @param isTerastallized 是否太晶化
 * @param variant 样式变体
 * @returns 完整的CSS类名字符串
 */
export function getTypeBadgeClassByTeraStatus(
  type: string,
  isTerastallized: boolean = false,
  variant: 'default' | 'light' = 'default'
): string {
  return isTerastallized ? getTeraTypeBadgeClass(type, variant) : getTypeBadgeClass(type, variant)
}
