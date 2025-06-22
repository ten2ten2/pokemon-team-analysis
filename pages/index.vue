<script setup lang="ts">
import { useSeoLinks } from '~/composables/useSeoLinks'
import { useCustomSeoMeta } from '~/composables/useSeoMeta'
import { useStructuredData } from '~/composables/useStructuredData'
import { useTeamStorage } from '~/composables/useTeamStorage'
import { useAsyncClientState } from '~/composables/useClientState'
import type { Team, TeamImportData, TeamUpdateData } from '~/types/team'
import { normalizeTeamName, cloneTeam, getSprite } from '~/utils/teamUtils'
import type { Pokemon } from '~/lib/core/types'
import { formatDate } from '~/utils/formatDate'

const { t, locale } = useI18n()
const pageName = 'home'

// SEO setup
useSeoLinks()
useCustomSeoMeta({ page: pageName })
useStructuredData({ page: pageName })

// Team storage
const { getTeams, addTeam, deleteTeam, updateTeam } = useTeamStorage()

// Use async client state for teams data to avoid hydration mismatch
const {
  state: teams,
  isHydrated,
  isLoading,
  error: teamsError,
  setState: setTeams
} = useAsyncClientState<Team[]>([], async () => {
  return getTeams()
})

// Modal state
const isModalOpen = ref(false)
const modalMode = ref<'import' | 'edit'>('import')
const editingTeam = ref<Team | null>(null)
const isConfirmDeleteOpen = ref(false)
const teamToDelete = ref<Team | null>(null)

// Methods
const createNewTeam = () => {
  modalMode.value = 'import'
  editingTeam.value = null
  isModalOpen.value = true
}

const createFirstTeam = () => {
  modalMode.value = 'import'
  editingTeam.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingTeam.value = null
}

const handleTeamImport = (data: TeamImportData) => {
  // Add team to localStorage and get the created team
  const newTeam = addTeam(data)

  // Update local reactive state
  if (import.meta.client && isHydrated.value) {
    const currentTeams = Array.isArray(teams.value) ? [...teams.value] : []
    setTeams([newTeam, ...currentTeams])
  }
}

const handleTeamUpdate = (data: TeamUpdateData) => {
  // Update in localStorage
  const updatedTeam = updateTeam(data.id, {
    name: normalizeTeamName(data.teamName),
    teamRawData: data.teamRawData,
    gameVersion: data.gameVersion,
    rules: data.rules
  })

  if (updatedTeam && import.meta.client && isHydrated.value) {
    // Update local reactive state
    const currentTeams = Array.isArray(teams.value) ? [...teams.value] : []
    const teamIndex = currentTeams.findIndex(team => team.id === data.id)
    if (teamIndex !== -1) {
      currentTeams[teamIndex] = updatedTeam
      setTeams([...currentTeams])
    }
  }
}

const handleDeleteTeam = (teamId: string) => {
  const currentTeams = Array.isArray(teams.value) ? [...teams.value] : []
  const team = currentTeams.find(t => t.id === teamId)
  if (team) {
    teamToDelete.value = team
    isConfirmDeleteOpen.value = true
  }
}

const confirmDeleteTeam = () => {
  if (teamToDelete.value) {
    // Delete from localStorage
    const success = deleteTeam(teamToDelete.value.id)

    if (success && import.meta.client && isHydrated.value) {
      // Update local reactive state
      const currentTeams = Array.isArray(teams.value) ? [...teams.value] : []
      setTeams(currentTeams.filter(team => team.id !== teamToDelete.value!.id))
    }

    // Reset state
    teamToDelete.value = null
    isConfirmDeleteOpen.value = false
  }
}

const cancelDeleteTeam = () => {
  teamToDelete.value = null
  isConfirmDeleteOpen.value = false
}

const startEditingTeam = (team: any) => {
  modalMode.value = 'edit'
  // Create a mutable copy of the team using cloneTeam
  editingTeam.value = cloneTeam(team)
  isModalOpen.value = true
}
</script>

<template>
  <div class="flex-1 flex flex-col">
    <!-- Main Content Container -->
    <main class="flex-1 flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Hero Section - Hidden for visual design but accessible for SEO -->
      <header class="sr-only">
        <h1>{{ t('home.meta.title') }}</h1>
        <p>{{ t('home.meta.description') }}</p>
      </header>

      <!-- Teams Section -->
      <section class="flex-1 flex flex-col w-full" aria-labelledby="teams-heading">
        <!-- Teams Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <h2 id="teams-heading" class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('home.allTeams') }}
          </h2>
          <button v-if="isHydrated && teams.length > 0" @click="createNewTeam"
            class="btn-primary inline-flex items-center justify-center px-6 py-3 shadow-md hover:shadow-lg focus-ring-red transform hover:scale-105 active:scale-95 w-auto"
            :disabled="isLoading" :aria-label="'Create new Pokémon team'">
            <Plus class="w-5 h-5 mr-2" aria-hidden="true" />
            {{ t('home.newTeam') }}
          </button>
        </div>

        <!-- Teams Content -->
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col min-h-0 w-full">
          <!-- Loading State -->
          <div v-if="isLoading || !isHydrated" class="flex items-center justify-center flex-1" role="status"
            :aria-label="t('common.loading.teams')">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <span class="sr-only">{{ t('common.loading.teams') }}</span>
          </div>

          <!-- Error State -->
          <div v-else-if="teamsError" class="flex items-center justify-center flex-1 text-center py-8">
            <div class="text-red-600 dark:text-red-400">
              <AlertCircle class="w-12 h-12 mx-auto mb-4" />
              <p class="text-lg font-medium mb-2">{{ t('common.error.title') }}</p>
              <p class="text-sm">{{ t('common.error.loadingTeams') }}</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="isHydrated && teams.length === 0"
            class="text-center py-8 sm:py-12 px-6 flex-1 flex flex-col justify-center items-center">
            <!-- Empty State Icon -->
            <div
              class="w-20 h-20 sm:w-24 sm:h-24 mb-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0">
              <Plus class="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>

            <!-- Empty State Content -->
            <div class="flex-shrink-0">
              <h3 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('home.noTeams') }}
              </h3>
              <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                {{ t('home.noTeamsDescription') }}
              </p>

              <!-- Create First Team Button -->
              <button @click="createFirstTeam"
                class="btn-primary inline-flex items-center justify-center px-8 py-4 shadow-lg hover:shadow-xl focus-ring-red transform hover:scale-105 active:scale-95"
                :aria-label="'Create your first Pokémon team'">
                <Plus class="w-5 h-5 mr-2" aria-hidden="true" />
                {{ t('home.createFirstTeam') }}
              </button>
            </div>
          </div>

          <!-- Teams Grid (when teams exist) -->
          <div v-else-if="isHydrated && teams.length > 0" class="p-6 sm:p-8 flex-1 overflow-y-auto min-h-0">
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-max">
              <!-- Team cards will be rendered here -->
              <div v-for="team in teams" :key="team.id" class="relative">
                <!-- Action buttons positioned absolutely outside the link -->
                <nav class="absolute top-6 right-5 z-10 flex items-center gap-1"
                  :aria-label="`Actions for ${team.name}`">
                  <button @click="startEditingTeam(team)"
                    class="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors focus-ring-gray"
                    :aria-label="`Edit team: ${team.name}`" type="button">
                    <Edit3 class="w-4 h-4" aria-hidden="true" />
                    <span class="sr-only">Edit</span>
                  </button>
                  <button @click="handleDeleteTeam(team.id)"
                    class="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors focus-ring-gray"
                    :aria-label="`Delete team: ${team.name}`" type="button">
                    <Trash2 class="w-4 h-4" aria-hidden="true" />
                    <span class="sr-only">Delete</span>
                  </button>
                </nav>

                <NuxtLinkLocale :to="`/teams/${team.id}`" class="no-underline block">
                  <article
                    class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200 h-fit cursor-pointer"
                    :aria-labelledby="`team-${team.id}-title`">
                    <!-- Team card header -->
                    <header class="mb-3">
                      <!-- Team name -->
                      <div class="pr-16">
                        <h3 :id="`team-${team.id}-title`" :title="team.name"
                          class="font-semibold text-gray-900 dark:text-white text-lg truncate">
                          {{ team.name }}
                        </h3>
                      </div>
                    </header>

                    <!-- Team description -->
                    <p class="text-sm mb-4">
                      <template v-if="team.errors && team.errors.length > 0">
                        <span class="text-red-600 dark:text-red-400 leading-tight">
                          <AlertCircle class="w-3.5 h-3.5 inline align-baseline relative top-0.5" aria-hidden="true" />
                          {{ t('home.teamHasProblems') }}
                        </span>
                      </template>
                      <template v-else>
                        <ul class="flex flex-row gap-1 items-center">
                          <li v-for="pkm in team.teamData" :key="pkm.species">
                            <NuxtImg
                              :src="pkm.shiny ? getSprite(pkm as Pokemon, 'default-shiny') : getSprite(pkm as Pokemon)"
                              :alt="pkm.species" :title="pkm.species" height="32" width="32" loading="lazy" />
                          </li>
                        </ul>
                      </template>
                    </p>

                    <!-- Team metadata -->
                    <footer class="space-y-2">
                      <!-- Game version -->
                      <dl class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Gamepad2 class="w-4 h-4 mr-2" aria-hidden="true" />
                        <dt class="sr-only">Game version:</dt>
                        <dd>{{ t(`common.gameVersion.options.${team.gameVersion}`) }}</dd>
                      </dl>

                      <!-- Rules -->
                      <dl class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <FileText class="w-4 h-4 mr-2" aria-hidden="true" />
                        <dt class="sr-only">Rules:</dt>
                        <dd>{{ t(`common.rules.options.${team.rules}`) }}</dd>
                      </dl>

                      <!-- Created date -->
                      <dl class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar class="w-4 h-4 mr-2" aria-hidden="true" />
                        <dt class="sr-only">Created on:</dt>
                        <dd>
                          <time :datetime="team.createdAt.toISOString()">
                            {{ formatDate(team.createdAt.toISOString(), locale) }}
                          </time>
                        </dd>
                      </dl>
                    </footer>
                  </article>
                </NuxtLinkLocale>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Team Modal -->
    <TeamEditModal :is-open="isModalOpen" :mode="modalMode" :team="editingTeam" @close="closeModal"
      @import="handleTeamImport" @update="handleTeamUpdate" />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog :is-open="isConfirmDeleteOpen" :title="t('confirmDialog.deleteTeam.title')"
      :message="t('confirmDialog.deleteTeam.message')" :confirm-text="t('confirmDialog.deleteTeam.confirmButton')"
      :cancel-text="t('confirmDialog.deleteTeam.cancelButton')" variant="danger" @confirm="confirmDeleteTeam"
      @cancel="cancelDeleteTeam" @close="cancelDeleteTeam" />
  </div>
</template>
