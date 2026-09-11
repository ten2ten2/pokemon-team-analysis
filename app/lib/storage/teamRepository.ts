import type { Team, TeamInput } from '~/types/team'
import { DEFAULT_GAME_VERSION, DEFAULT_RULES } from '~/types/team'
import { normalizeTeamName } from '~/utils/teamUtils'
import { parseAndValidateTeam } from '~/lib/parser/teamParser'

const STORAGE_KEY = 'pokemon-teams'
type TeamStorage = Pick<Storage, 'getItem' | 'setItem'>
type StoredTeam = Pick<Team, 'id' | 'name' | 'gameVersion' | 'rules' | 'teamRawData'> & { createdAt: string }

function hydrateTeam(stored: StoredTeam): Team {
  const rules = stored.rules || DEFAULT_RULES
  const { teamParsed, errors } = parseAndValidateTeam(stored.teamRawData, rules)
  return {
    ...stored, name: normalizeTeamName(stored.name), rules,
    gameVersion: stored.gameVersion || DEFAULT_GAME_VERSION,
    createdAt: new Date(stored.createdAt), teamData: teamParsed, errors,
  }
}

export function createTeamRepository(storage: TeamStorage) {
  const read = (): StoredTeam[] => {
    const stored: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored) || stored.some(team =>
      !team || typeof team.id !== 'string' || typeof team.teamRawData !== 'string'
      || !Number.isFinite(Date.parse(team.createdAt)))) {
      throw new Error('Saved team data is invalid')
    }
    return stored
  }

  const write = (teams: (Team | StoredTeam)[]) => {
    // Do not persist derived stats, moves or validation errors: dependency upgrades can change them.
    const stored = teams.map(({ id, name, gameVersion, rules, teamRawData, createdAt }) => ({
      id, name: normalizeTeamName(name), gameVersion, rules, teamRawData, createdAt,
    }))
    storage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }

  return {
    getTeams: (): Team[] => read().map(hydrateTeam),
    getTeam: (id: string): Team | null => {
      const stored = read().find(team => team.id === id)
      return stored ? hydrateTeam(stored) : null
    },
    addTeam: (input: TeamInput): Team => {
      const stored: StoredTeam = {
        id: crypto.randomUUID(), name: normalizeTeamName(input.teamName),
        gameVersion: input.gameVersion, rules: input.rules, teamRawData: input.teamRawData,
        createdAt: input.createdAt.toISOString(),
      }
      const team = hydrateTeam(stored)
      write([team, ...read()])
      return team
    },
    updateTeam: (id: string, updates: Partial<Pick<Team, 'name' | 'gameVersion' | 'rules' | 'teamRawData'>>): Team | null => {
      const stored = read()
      const index = stored.findIndex(team => team.id === id)
      const current = stored[index]
      if (!current) return null
      const updated = hydrateTeam({ ...current, ...updates })
      stored[index] = { ...updated, createdAt: updated.createdAt.toISOString() }
      write(stored)
      return updated
    },
    deleteTeam: (id: string): boolean => {
      write(read().filter(team => team.id !== id))
      return true
    },
  }
}
