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
