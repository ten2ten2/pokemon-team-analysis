import type { Pokemon } from '~/lib/core/types'

// ==================== 常量定义 ====================

export const GAME_VERSIONS = {
  SV: 'sv'
} as const

export const RULES = {
  DOUBLES_REG_G: 'doublesRegG',
  DOUBLES_REG_H: 'doublesRegH',
  DOUBLES_REG_I: 'doublesRegI',
  SINGLES_REG_G: 'singlesRegG',
  SINGLES_REG_H: 'singlesRegH',
  SINGLES_REG_I: 'singlesRegI'
} as const

export const GENERATION_MAP: Record<GameVersion, number> = {
  [GAME_VERSIONS.SV]: 9,
} as const

// ==================== 默认值 ====================

export const DEFAULT_GAME_VERSION = GAME_VERSIONS.SV
export const DEFAULT_RULES = RULES.DOUBLES_REG_I

// ==================== 联合类型 ====================

export type GameVersion = typeof GAME_VERSIONS[keyof typeof GAME_VERSIONS]
export type Rules = typeof RULES[keyof typeof RULES]

// ==================== 选项配置 ====================

export interface SelectOption {
  value: string
  label: string
}

// ==================== 接口定义 ====================

export interface Team {
  id: string
  name: string
  gameVersion: GameVersion
  rules: Rules
  teamRawData: string
  teamData: Pokemon[]
  errors: string[] | null
  createdAt: Date
}

export interface TeamInput {
  teamName: string
  teamRawData: string
  gameVersion: GameVersion
  rules: Rules
  createdAt: Date
}

// ==================== 事件数据类型 ====================

export interface TeamImportData {
  teamName: string
  teamRawData: string
  gameVersion: GameVersion
  rules: Rules
  createdAt: Date
}

export interface TeamUpdateData {
  id: string
  teamName: string
  teamRawData: string
  gameVersion: GameVersion
  rules: Rules
  errors: string[] | null
}
