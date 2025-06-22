import type { Team, TeamInput } from '~/types/team'
import { DEFAULT_GAME_VERSION, DEFAULT_RULES } from '~/types/team'
import { normalizeTeamName } from '~/utils/teamUtils'
import { parseAndValidateTeam } from '~/lib/parser/teamParser'
import { generateId, type IdGeneratorOptions } from '~/utils/idGenerator'

const STORAGE_KEY = 'pokemon-teams'

// ID 生成配置 - 可以根据需要调整
const ID_CONFIG: IdGeneratorOptions = {
  type: 'hybrid', // 推荐：时间戳 + 随机，如 "l8x9k2m-a3k9"
  length: 4 // 随机部分长度
}

// 安全的客户端检查函数
const isClient = () => {
  return import.meta.client && typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

// 安全的 localStorage 操作包装器
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isClient()) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('localStorage.getItem failed:', error)
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isClient()) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn('localStorage.setItem failed:', error)
      return false
    }
  },

  removeItem: (key: string): boolean => {
    if (!isClient()) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error)
      return false
    }
  }
}

export const useTeamStorage = () => {
  // 获取所有队伍数据
  const getTeams = (): Team[] => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    try {
      const teams = JSON.parse(stored) as Team[]
      // 确保 createdAt 是 Date 对象，并验证数据完整性
      return teams.filter(team => team && team.id && team.name).map(team => {
        // 如果旧数据没有 teamData，需要解析
        let teamData = Array.isArray(team.teamData) ? team.teamData : []
        let errors = team.errors || null

        if (!Array.isArray(team.teamData) && team.teamRawData) {
          // 旧数据需要解析
          const parsedResult = parseAndValidateTeam(team.teamRawData, team.rules)
          teamData = parsedResult.teamParsed || []
          errors = parsedResult.errors
        }

        return {
          ...team,
          createdAt: team.createdAt ? new Date(team.createdAt) : new Date(),
          name: normalizeTeamName(team.name),
          gameVersion: team.gameVersion || DEFAULT_GAME_VERSION,
          rules: team.rules || DEFAULT_RULES,
          teamRawData: team.teamRawData || '',
          teamData,
          errors
        }
      })
    } catch (error) {
      console.error('Error loading teams from localStorage:', error)
      return []
    }
  }

  // 保存队伍数据
  const saveTeams = (teams: Team[]): boolean => {
    try {
      const success = safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
      if (!success) {
        console.error('Failed to save teams to localStorage')
      }
      return success
    } catch (error) {
      console.error('Error saving teams to localStorage:', error)
      return false
    }
  }

  // 添加新队伍
  const addTeam = (teamInput: TeamInput): Team => {
    // 解析队伍数据
    const parsedResult = parseAndValidateTeam(teamInput.teamRawData, teamInput.rules)
    const teamData = parsedResult.teamParsed || []
    const errors = parsedResult.errors

    const newTeam: Team = {
      id: generateId(ID_CONFIG),
      name: normalizeTeamName(teamInput.teamName),
      gameVersion: teamInput.gameVersion,
      rules: teamInput.rules,
      teamRawData: teamInput.teamRawData,
      teamData,
      errors,
      createdAt: teamInput.createdAt
    }

    const currentTeams = getTeams()
    const updatedTeams = [newTeam, ...currentTeams]
    saveTeams(updatedTeams)

    return newTeam
  }

  // 删除队伍
  const deleteTeam = (teamId: string): boolean => {
    const currentTeams = getTeams()
    const updatedTeams = currentTeams.filter(team => team.id !== teamId)
    return saveTeams(updatedTeams)
  }

  // 更新队伍
  const updateTeam = (teamId: string, updates: Partial<Omit<Team, 'id'>>): Team | null => {
    const currentTeams = getTeams()
    const teamIndex = currentTeams.findIndex(team => team.id === teamId)

    if (teamIndex === -1) return null

    let updatedTeam = { ...currentTeams[teamIndex], ...updates }

    // 如果 teamRawData 或 rules 更新了，重新解析 teamData
    if (updates.teamRawData !== undefined || updates.rules !== undefined) {
      const parsedResult = parseAndValidateTeam(
        updatedTeam.teamRawData,
        updatedTeam.rules
      )
      updatedTeam.teamData = parsedResult.teamParsed || []
      updatedTeam.errors = parsedResult.errors
    }

    currentTeams[teamIndex] = updatedTeam
    const success = saveTeams(currentTeams)

    return success ? updatedTeam : null
  }

  // 获取单个队伍
  const getTeam = (teamId: string): Team | null => {
    const teams = getTeams()
    return teams.find(team => team.id === teamId) || null
  }

  // 清空所有队伍数据
  const clearAllTeams = (): boolean => {
    return safeLocalStorage.removeItem(STORAGE_KEY)
  }

  return {
    getTeams,
    addTeam,
    deleteTeam,
    updateTeam,
    getTeam,
    clearAllTeams
  }
}


