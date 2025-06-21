import type { PokemonSet } from '@pkmn/sets'
import type { StatsTable } from '@pkmn/types'

// ==================== Core Types ====================

export type StatKey = 'atk' | 'def' | 'spa' | 'spd' | 'spe'
export type NatureModifier = 1.1 | 1.0 | 0.9

/**
 * 系统健康状态类型
 * - healthy: 系统运行正常
 * - warning: 存在潜在问题，需要关注
 * - critical: 存在严重问题，需要立即处理
 */
export type HealthStatus = 'healthy' | 'warning' | 'critical'

// ==================== Pokemon Core ====================

export interface Pokemon extends PokemonSet {
  baseStats: StatsTable
  stats: StatsTable
  types: string[]
  pokeApiNum: number
  movesDetails: Record<string, any>
}

export interface NatureEffect {
  readonly increased?: StatKey
  readonly decreased?: StatKey
}

// ==================== Pokemon Data ====================

export interface PokemonSpeciesData {
  id: number
  name: string
  types: string[]
  baseStats: StatsTable
  abilities: string[]
  hiddenAbility?: string
}

export interface PokemonMoveData {
  name: string
  type: string
  category: 'Physical' | 'Special' | 'Status'
  power?: number
  accuracy?: number
  pp: number
  priority: number
  description: string
}

export interface PokemonAbilityData {
  name: string
  description: string
  effect: string
}

export interface PokemonItemData {
  name: string
  description: string
  effect: string
  category: string
}

// ==================== Pokemon Analysis ====================

export interface PokemonAnalysisData extends Pokemon {
  index: number
  displayName: string
  spriteUrl: string
  typeEffectiveness: Record<string, number>
  moveDetails: Record<string, PokemonMoveData>
}

// ==================== Validation ====================

export interface PokemonValidationError {
  pokemonIndex: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface TeamValidationResult {
  isValid: boolean
  errors: PokemonValidationError[]
  warnings: PokemonValidationError[]
  teamSize: number
  duplicateSpecies: string[]
}

// ==================== Analysis Cache ====================

export interface TeamAnalysisCache {
  resistance?: ResistanceAnalysisResult
  coverage?: CoverageAnalysisResult
  lastCalculated: Date
  version: string
}

// ==================== Resistance Analysis ====================

export interface ResistanceAnalysisResult {
  summary: ResistanceSummary
  typeResistances: TypeResistanceData[]
  pokemonData: ResistanceItem[]
}

export interface ResistanceSummary {
  totalTypes: number
  teamSize: number
  weaknesses: { type: string; count: number }[]
  resistances: { type: string; count: number }[]
  immunities: { type: string; count: number }[]
}

export interface TypeResistanceData {
  type: string
  effectiveness: number[]
  summary: {
    weak: number
    neutral: number
    resist: number
    immune: number
  }
}

export interface ResistanceItem {
  name: string
  types: string[]
  resistances: Record<string, number>
  index: number
}

// ==================== Coverage Analysis ====================

export interface CoverageAnalysisResult {
  summary: CoverageSummary
  typeCoverage: TypeCoverageData[]
  moveAnalysis: MoveAnalysisData[]
}

export interface CoverageSummary {
  totalTypes: number
  coveredTypes: number
  coveragePercentage: number
  superEffectiveCount: number
  notVeryEffectiveCount: number
  noEffectCount: number
}

export interface TypeCoverageData {
  type: string
  effectiveness: number[]
  bestMove?: string
  summary: {
    superEffective: number
    neutral: number
    notVeryEffective: number
    noEffect: number
  }
}

export interface MoveAnalysisData {
  pokemonIndex: number
  pokemonName: string
  moves: {
    name: string
    type: string
    category: string
    power?: number
    coverage: string[]
  }[]
}
