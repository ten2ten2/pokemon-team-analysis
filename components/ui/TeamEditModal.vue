<script setup lang="ts">
import type { Team, TeamImportData, TeamUpdateData, GameVersion, Rules } from '~/types/team'
import { DEFAULT_GAME_VERSION, DEFAULT_RULES } from '~/types/team'

interface Props {
  isOpen: boolean
  mode: 'import' | 'edit'
  team?: Team | null
}

interface Emits {
  (e: 'close'): void
  (e: 'import', data: TeamImportData): void
  (e: 'update', data: TeamUpdateData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { gameVersionOptions, rulesOptions } = useTeamOptions()
const teamRawData = ref('')
const gameVersion = ref<GameVersion>(DEFAULT_GAME_VERSION)
const rules = ref<Rules>(DEFAULT_RULES)
const isImporting = ref(false)
const teamName = ref('')

// Initialize form data when editing
watch([() => props.team, () => props.mode], ([team, mode]) => {
  if (team && mode === 'edit') {
    teamName.value = team.name
    teamRawData.value = team.teamRawData
    gameVersion.value = team.gameVersion
    rules.value = team.rules
  } else if (mode === 'import') {
    // Reset form data for import mode
    teamName.value = ''
    teamRawData.value = ''
    gameVersion.value = DEFAULT_GAME_VERSION
    rules.value = DEFAULT_RULES
  }
}, { immediate: true })

// Close modal
const closeModal = () => {
  emit('close')
  // 不在这里重置表单数据，让 watch 处理
}

// Handle submit (import or update)
const handleSubmit = async () => {
  if (!teamRawData.value.trim()) return

  isImporting.value = true
  try {
    if (props.mode === 'edit' && props.team) {
      emit('update', {
        id: props.team.id,
        teamName: teamName.value,
        teamRawData: teamRawData.value.trim(),
        gameVersion: gameVersion.value,
        rules: rules.value,
        errors: props.team.errors
      })
    } else {
      emit('import', {
        teamName: teamName.value,
        teamRawData: teamRawData.value.trim(),
        gameVersion: gameVersion.value,
        rules: rules.value,
        createdAt: new Date()
      })
    }
    closeModal()
  } catch (error) {
    console.error('Error saving team:', error)
  } finally {
    isImporting.value = false
  }
}

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (target.classList.contains('modal-overlay')) {
    closeModal()
  }
}

// Watch for modal open/close to handle body scroll and keyboard events
watch(() => props.isOpen, (isOpen) => {
  // Only run on client side to avoid hydration mismatch
  if (import.meta.client) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
      // Reset form data when modal closes (only for import mode or when no team)
      nextTick(() => {
        if (!isOpen && (props.mode === 'import' || !props.team)) {
          teamRawData.value = ''
          teamName.value = ''
          gameVersion.value = DEFAULT_GAME_VERSION
          rules.value = DEFAULT_RULES
        }
      })
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isOpen" class="modal-overlay" @click="handleClickOutside">
        <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-300"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="isOpen" class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title"
            aria-describedby="modal-description">
            <!-- Modal Header -->
            <header class="modal-header">
              <h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ mode === 'edit' ? t('teamEditModal.title') : t('teamImportModal.title') }}
              </h2>
              <button @click="closeModal" class="modal-close-btn" aria-label="Close modal" type="button">
                <X class="w-5 h-5" aria-hidden="true" />
              </button>
            </header>

            <!-- Modal Content -->
            <main class="modal-content" id="modal-description">
              <div class="space-y-6">
                <!-- Instructions -->
                <div v-if="mode === 'import'"
                  class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    {{ t('teamImportModal.instructions.title') }}
                  </h3>
                  <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    <li>• {{ t('teamImportModal.instructions.content.1') }}</li>
                    <li>• {{ t('teamImportModal.instructions.content.2') }}</li>
                    <li>• {{ t('teamImportModal.instructions.content.3') }}</li>
                  </ul>
                </div>
                <div v-else-if="team?.errors && team.errors.length > 0"
                  class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    {{ t('teamEditModal.problemTitle') }}
                  </h3>
                  <ul v-for="item in team?.errors" :key="item"
                    class="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                    <li>{{ item }}</li>
                  </ul>
                </div>

                <!-- Team Name -->
                <div>
                  <label for="team-name" class="form-label">
                    {{ t('common.teamName.title') }}
                  </label>
                  <input id="team-name" v-model="teamName" class="form-input" :disabled="isImporting"
                    :placeholder="t('common.teamName.untitled')" maxlength="16" />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ teamName.length }}/16
                  </p>
                </div>

                <!-- Team Options -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Game Version -->
                  <div>
                    <label for="game-version" class="form-label">
                      {{ t('common.gameVersion.title') }}
                    </label>
                    <select id="game-version" v-model="gameVersion" class="form-select" :disabled="isImporting">
                      <option v-for="option in gameVersionOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Rules -->
                  <div>
                    <label for="rules" class="form-label">
                      {{ t('common.rules.title') }}
                    </label>
                    <select id="rules" v-model="rules" class="form-select" :disabled="isImporting">
                      <option v-for="option in rulesOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Team Data Input -->
                <div>
                  <label for="team-data" class="form-label">
                    {{ t('teamImportModal.dataInputTitle') }}
                  </label>
                  <textarea id="team-data" v-model="teamRawData" class="form-textarea h-64"
                    :placeholder="t('teamImportModal.dataInputPlaceholder')" :disabled="isImporting"></textarea>
                </div>
              </div>
            </main>

            <!-- Modal Footer -->
            <footer class="modal-footer">
              <button @click="closeModal" class="btn-secondary focus-ring-gray" :disabled="isImporting">
                {{ t('teamImportModal.cancelButton') }}
              </button>
              <button @click="handleSubmit"
                class="btn-primary focus-ring-red inline-flex items-center px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!teamRawData.trim() || isImporting">
                <Loader2 v-if="isImporting" class="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                {{ isImporting ?
                  (mode === 'edit' ? t('teamEditModal.saving') : t('teamImportModal.importing')) :
                  (mode === 'edit' ? t('teamEditModal.saveButton') : t('teamImportModal.importButton')) }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
