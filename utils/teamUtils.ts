/**
 * 队伍相关的工具函数
 */

import type { Team } from '~/types/team'
import { type Pokemon, SPRITES_URL_PREFIX } from '~/types/pokemon'

export const DEFAULT_TEAM_NAME = 'Untitled Team'

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
 * 将名称转换为小写，并去除非字母数字和空格
 * @param name - 名称
 * @returns 处理后的名称
 */
export function normalizeName(name: string): string {
  return name.toLowerCase()       // 转换为小写
    .replace(/\s*-\s*/g, '-')     // 把「多个空格 + 连字符 + 多个空格」都统一替换成单个连字符
    .replace(/[^a-z0-9 \-]/g, '') // 移除所有非字母、数字、空格和连字符的字符
    .replace(/ +/g, '-')          // 将所有空格替换为连字符
}

/**
 * 获取精灵图片
 * @param pkm - 精灵
 * @param stripeType - 精灵图片类型
 * @returns 精灵图片
 */
export const getSprite = (pkm: Pokemon, stripeType: string = 'default') => {
  return `${SPRITES_URL_PREFIX[stripeType]}${pkm.pokeApiNum}.png`
}

/**
 * 深拷贝 Pokemon 对象，转换 readonly 类型为可变类型
 */
export function clonePokemon(pokemon: any): Pokemon {
  return {
    ...pokemon,
    types: [...(pokemon.types || [])],
    moves: [...(pokemon.moves || [])],
    stats: pokemon.stats ? { ...pokemon.stats } : undefined,
    ivs: pokemon.ivs ? { ...pokemon.ivs } : undefined,
    evs: pokemon.evs ? { ...pokemon.evs } : undefined
  }
}

/**
 * 深拷贝 Team 对象，转换 readonly 类型为可变类型
 */
export function cloneTeam(team: any): Team {
  return {
    ...team,
    teamData: (team.teamData || []).map(clonePokemon),
    errors: team.errors ? [...team.errors] : null
  }
}
