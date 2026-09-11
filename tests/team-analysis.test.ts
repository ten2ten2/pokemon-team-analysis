import { describe, expect, it } from 'vitest'
import { Dex } from '@pkmn/sim'
import { calculateStats } from '../app/lib/calculator/statsCalculator'
import { parseAndValidateTeam } from '../app/lib/parser/teamParser'
import { CoverageAnalyzer } from '../app/lib/analyzer/coverageAnalyzer'
import { ResistanceAnalyzer } from '../app/lib/analyzer/resistanceAnalyzer'
import { initializeFormats } from '../app/lib/core/formats/formatInitializer'
import { createTeamRepository } from '../app/lib/storage/teamRepository'
import type { Pokemon } from '../app/lib/core/types'
import type { TeamInput } from '../app/types/team'

const raw = `Rillaboom @ Assault Vest
Ability: Grassy Surge
Level: 100
Adamant Nature
- Wood Hammer
- Fake Out
- U-turn
- High Horsepower`
const parse = (text = raw, rules = 'doublesRegI') => parseAndValidateTeam(text, rules)
const attacker = (text: string): Pokemon => {
  const result = parse(text)
  expect(result.teamParsed).toHaveLength(1)
  return result.teamParsed[0]!
}
const resistance = new ResistanceAnalyzer()
const dragonMultiplier = (pokemon: Pokemon, teraType: string) => resistance.analyze([pokemon], {
  terrain: 'Misty Terrain', terastallization: { index: 0, teraType },
}).typeResistances.find(row => row.type === 'Dragon')!.pokemonMultipliers[0]

it('calculates level-50 stats with nature applied after integer rounding', () => {
  const pokemon = parse().teamParsed[0]!
  expect(pokemon.level).toBe(50)
  expect(pokemon.stats.atk).toBe(159)
  expect(calculateStats({ hp: 1 }, undefined, undefined, 50).hp).toBe(1)
})

it('rejects invalid numeric levels', () => {
  for (const level of [0, 101, 50.5, NaN]) {
    expect(() => calculateStats(undefined, undefined, undefined, level)).toThrow()
  }
})

it('retains unknown move text and validation errors without fabricating move data', () => {
  const result = parse(raw.replace('Wood Hammer', 'Wood Hamer'))
  expect(result.errors.join(' ')).toContain('invalid move')
  expect(result.teamParsed[0]!.moves).toContain('Wood Hamer')
  expect(result.teamParsed[0]!.movesDetails['Wood Hamer']).toBeUndefined()
  expect(result.teamParsed[0]!.level).toBe(50)
})

it('keeps valid members when a species cannot be resolved', () => {
  const result = parse(`${raw}\n\nNotAPokemon\n- Tackle`)
  expect(result.teamParsed[0]!.species).toBe('Rillaboom')
  expect(result.errors.length).toBeGreaterThan(0)
})

it('registers regulation formats idempotently and enforces Regulation H bans', () => {
  initializeFormats()
  initializeFormats()
  for (const mode of ['doubles', 'singles']) {
    const table = Dex.formats.getRuleTable(Dex.formats.get(`${mode}RegH`))
    for (const species of ['Urshifu', 'Tornadus', 'Flutter Mane', 'Koraidon', 'Mew']) {
      expect(table.isBannedSpecies(Dex.species.get(species)), species).toBe(true)
    }
    expect(table.isBannedSpecies(Dex.species.get('Rillaboom'))).toBe(false)
  }
})

it('uses current defensive typing for Misty Terrain, retaining original Stellar defenses', () => {
  const rillaboom = attacker(raw)
  const dragonite = attacker('Dragonite @ Leftovers\nAbility: Multiscale\n- Dragon Claw')
  expect(dragonMultiplier(rillaboom, 'Flying')).toBe(1)
  expect(dragonMultiplier(dragonite, 'Normal')).toBe(0.5)
  expect(dragonMultiplier(dragonite, 'Stellar')).toBe(2)
  expect(dragonMultiplier({ ...rillaboom, item: 'Iron Ball' }, 'Flying')).toBe(0.5)
})

it('handles Freeze-Dry and mask-form Ivy Cudgel in both coverage views', () => {
  const kyurem = attacker('Kyurem @ Leftovers\nAbility: Pressure\n- Freeze-Dry')
  const ogerpon = attacker('Ogerpon-Hearthflame @ Hearthflame Mask\nAbility: Mold Breaker\n- Ivy Cudgel')
  const coverage = new CoverageAnalyzer().analyze([kyurem, ogerpon], {
    combination: { type1: 'Water', type2: 'Water' },
  })
  expect(coverage.combinationCoverage!.effectiveMovesSpecial[0]!.effectiveness).toBe(2)
  expect(coverage.combinationCoverage!.resistantMovesPhysical[0]!.type).toBe('Fire')
  const popularOgerponMoves = coverage.popularPokemonCoverage.flatMap(row => row.bestMoves.overall)
    .filter(move => move.id === 'ivycudgel')
  expect(popularOgerponMoves.length).toBeGreaterThan(0)
  expect(popularOgerponMoves.every(move => move.type === 'Fire')).toBe(true)
})

it('returns no selected combination and does not award damage to immune targets', () => {
  const pokemon = attacker(raw.replace('Wood Hammer', 'Body Slam'))
  const analyzer = new CoverageAnalyzer()
  expect(analyzer.analyze([pokemon]).combinationCoverage).toBeNull()
  const result = analyzer.analyze([pokemon], { combination: { type1: 'Ghost', type2: '' } })
  expect(result.combinationCoverage!.immuneMovesPhysical.find(move => move.id === 'bodyslam')!.damageScore).toBe(0)
})

describe('team persistence', () => {
  function memoryStorage(initial = '[]') {
    let value = initial
    return { getItem: () => value, setItem: (_key: string, data: string) => { value = data } }
  }
  const input: TeamInput = {
    teamName: 'Example', gameVersion: 'sv', rules: 'doublesRegI',
    teamRawData: raw, createdAt: new Date('2026-09-11T00:00:00Z'),
  }

  it('normalizes blank names and survives reload, addition and deletion of another team', () => {
    const storage = memoryStorage()
    const repository = createTeamRepository(storage)
    const original = repository.addTeam(input)
    expect(repository.updateTeam(original.id, { name: '   ' })!.name).toBe('Untitled Team')
    const second = repository.addTeam(input)
    repository.deleteTeam(second.id)
    const reloaded = createTeamRepository(storage).getTeam(original.id)!
    expect(reloaded.name).toBe('Untitled Team')
    expect(reloaded.teamData[0]!.stats.atk).toBe(159)
    expect(JSON.parse(storage.getItem())[0]).not.toHaveProperty('teamData')
  })

  it('recalculates persisted derived data and preserves existing blank-name records', () => {
    const repository = createTeamRepository(memoryStorage(JSON.stringify([{
      ...input, id: 'existing', name: '', createdAt: input.createdAt.toISOString(),
      teamData: [{ stats: { atk: 999 } }],
    }])))
    const team = repository.getTeam('existing')!
    expect(team.name).toBe('Untitled Team')
    expect(team.teamData[0]!.stats.atk).toBe(159)
  })

  it('does not report success or overwrite data after storage failures', () => {
    const full = createTeamRepository({ getItem: () => '[]', setItem: () => { throw new Error('Quota exceeded') } })
    expect(() => full.addTeam(input)).toThrow('Quota exceeded')
    const storage = memoryStorage('{broken')
    expect(() => createTeamRepository(storage).addTeam(input)).toThrow()
    expect(storage.getItem()).toBe('{broken')
  })
})
