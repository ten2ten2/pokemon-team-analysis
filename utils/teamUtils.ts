/**
 * 队伍相关的工具函数
 */

export const DEFAULT_TEAM_NAME = 'Untitled Team'

/**
 * 处理队伍名称，如果为空或全是空格则返回默认名称
 * @param teamName - 队伍名称
 * @returns 处理后的队伍名称
 */
export const normalizeTeamName = (teamName: string | undefined | null): string => {
  if (!teamName || !teamName.trim()) {
    return DEFAULT_TEAM_NAME
  }
  return teamName.trim()
}
