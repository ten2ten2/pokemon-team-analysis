import { type PokemonSet } from '@pkmn/sets'
import type { Move } from '@pkmn/data'

// ==================== 常量定义 ====================

export const SPRITES_URL_PREFIX: Record<string, string> = {
  'default': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/',
  'default-shiny': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/',
  'official-artwork': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
  'official-artwork-shiny': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/',
} as const

// ==================== 类型定义 ====================

/**
 * 扩展的宝可梦接口，包含额外的类型和精灵图片信息
 */
export interface Pokemon extends PokemonSet {
  types: string[]
  pokeapiNum: number
  movesDetails: Record<string, Move>
}
