import type { TeamInput, Team } from '~/types/team'

export const useTeamStorage = () => {
  const repository = async () => {
    if (!import.meta.client) throw new Error('Team storage is available in the browser only')
    const { createTeamRepository } = await import('~/lib/storage/teamRepository')
    return createTeamRepository(localStorage)
  }
  const hasStoredTeams = () => import.meta.client && localStorage.getItem('pokemon-teams') !== null

  return {
    getTeams: async () => hasStoredTeams() ? (await repository()).getTeams() : [],
    getTeam: async (id: string) => hasStoredTeams() ? (await repository()).getTeam(id) : null,
    addTeam: async (input: TeamInput) => (await repository()).addTeam(input),
    updateTeam: async (id: string, updates: Partial<Pick<Team, 'name' | 'gameVersion' | 'rules' | 'teamRawData'>>) =>
      (await repository()).updateTeam(id, updates),
    deleteTeam: async (id: string) => (await repository()).deleteTeam(id),
  }
}
