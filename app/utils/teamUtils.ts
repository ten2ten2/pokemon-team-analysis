/**
 * 队伍相关的工具函数
 */

import type { Pokemon } from '~/lib/core/types'
import type { PokemonCoverage } from '~/lib/analyzer/coverageAnalyzer'

export const DEFAULT_TEAM_NAME = 'Untitled Team'

export const SPRITES_URL_PREFIX: Record<string, string> = {
  'default': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/',
  'default-shiny': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/',
  'official-artwork': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
  'official-artwork-shiny': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/',
} as const

/**
 * 处理队伍名称，如果为空或全是空格则返回默认名称，限制最大长度为16字符
 * @param name - 队伍名称
 * @returns 处理后的队伍名称
 */
export function normalizeTeamName(name: string): string {
  if (!name || typeof name !== 'string') {
    return DEFAULT_TEAM_NAME
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return DEFAULT_TEAM_NAME
  }

  // 限制最大长度为16字符
  return trimmed.length > 16 ? trimmed.substring(0, 16) : trimmed
}

/**
 * 获取精灵图片
 * @param pkm - 精灵
 * @param stripeType - 精灵图片类型
 * @returns 精灵图片
 */
export const getSprite = (pkm: Pokemon | PokemonCoverage, stripeType: string = 'default') => {
  return `${SPRITES_URL_PREFIX[stripeType]}${pkm.pokeApiNum}.png`
}
