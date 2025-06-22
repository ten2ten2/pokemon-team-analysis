import type { Move, Specie, StatsTable } from '@pkmn/data'
import { STAB_MULTIPLIER } from '~/lib/core/constants'

// 计算平均基础属性
export function computeAverageBaseStats(pokemonList: Specie[]): StatsTable {
  const totalBaseStats: StatsTable = {
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0
  }
  for (const pokemon of pokemonList) {
    totalBaseStats.hp += pokemon.baseStats.hp
    totalBaseStats.atk += pokemon.baseStats.atk
    totalBaseStats.def += pokemon.baseStats.def
    totalBaseStats.spa += pokemon.baseStats.spa
    totalBaseStats.spd += pokemon.baseStats.spd
    totalBaseStats.spe += pokemon.baseStats.spe
  }
  const averageBaseStats: StatsTable = {
    hp: totalBaseStats.hp / pokemonList.length,
    atk: totalBaseStats.atk / pokemonList.length,
    def: totalBaseStats.def / pokemonList.length,
    spa: totalBaseStats.spa / pokemonList.length,
    spd: totalBaseStats.spd / pokemonList.length,
    spe: totalBaseStats.spe / pokemonList.length
  }
  return averageBaseStats
}

// 估算伤害
// 等级固定 50，无场地无天气，随机数1，不考虑特性/状态，不击中要害
// 不考虑固定伤害类招式，不考虑特殊情况的招式如欺诈
export function estimateDamageLevel50(
  { atk, spa, STAB, effectiveness }: { atk: number, spa: number, STAB: boolean, effectiveness: number },
  { def, spd }: { def: number, spd: number },
  move: Move
): number {
  const a = move.category === 'Physical' ? atk : spa
  const b = move.category === 'Physical' ? def : spd

  const stabMult = STAB ? STAB_MULTIPLIER : 1
  const totalMult = stabMult * effectiveness

  return Math.floor(((2 * 50 + 10) / 250 * (a / b) * move.basePower + 2) * totalMult)
}
