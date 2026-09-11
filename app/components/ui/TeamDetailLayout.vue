<script setup lang="ts">
import type { Team, TeamUpdateData } from '~/types/team'

interface Props {
  teamId: string
  activeTab?: string
  showEditButton?: boolean
}

interface Emits {
  (e: 'tab-change', tab: string): void
  (e: 'team-update', data: TeamUpdateData): void
  (e: 'team-change', team: Team | null): void
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'overview',
  showEditButton: false
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getTeam, updateTeam } = useTeamStorage()
const { gameVersionOptions, rulesOptions } = useTeamOptions()
const { getTranslatedName } = usePokemonTranslations()
const { preferences, setUseTranslation } = useUserPreferences()

// 响应式数据
const team = shallowRef<Team | null>(null)
const pending = ref(true)
const showEditModal = ref(false)
const saving = ref(false)
const saveError = ref(false)
const loadError = ref(false)

// 使用用户偏好设置中的翻译开关
const useTranslation = computed({
  get: () => preferences.value.useTranslation,
  set: (value: boolean) => setUseTranslation(value)
})

let requestId = 0
const loadTeam = async () => {
  const request = ++requestId
  pending.value = true
  loadError.value = false
  team.value = null
  emit('team-change', null)
  try {
    const loaded = await getTeam(props.teamId)
    if (request !== requestId) return
    team.value = loaded
    emit('team-change', loaded)
  } catch {
    if (request === requestId) loadError.value = true
  } finally {
    if (request === requestId) pending.value = false
  }
}
onMounted(loadTeam)
watch(() => props.teamId, loadTeam)
onUnmounted(() => { requestId++ })
watch(showEditModal, () => { saveError.value = false })

// 创建翻译名称帮助函数
const translateName = (name: string, type: 'species' | 'ability' | 'move' | 'item' | 'type' = 'species') => {
  return getTranslatedName(name, type, unref(useTranslation))
}

// 获取游戏版本标签
const getGameVersionLabel = (gameVersion: string): string => {
  const option = gameVersionOptions.value.find(opt => opt.value === gameVersion)
  return option?.label || gameVersion
}

// 获取规则标签
const getRulesLabel = (rules: string): string => {
  const option = rulesOptions.value.find(opt => opt.value === rules)
  return option?.label || rules
}

// 处理团队更新
const handleTeamUpdate = async (data: TeamUpdateData) => {
  saving.value = true
  saveError.value = false
  try {
    const updated = await updateTeam(data.id, {
      name: data.teamName, teamRawData: data.teamRawData,
      gameVersion: data.gameVersion, rules: data.rules,
    })
    if (!updated) throw new Error('Team not found')
    team.value = updated
    emit('team-change', updated)
    emit('team-update', data)
    showEditModal.value = false
  } catch { saveError.value = true }
  finally { saving.value = false }
}

// 处理Tab切换
const handleTabChange = (tab: string) => {
  emit('tab-change', tab)
}

// 暴露给父组件的数据和方法
defineExpose({
  team: readonly(team),
  pending: readonly(pending),
  useTranslation,
  translateName,
  getGameVersionLabel,
  getRulesLabel
})

// SEO 设置
const seoTitle = computed(() =>
  team.value ? `${team.value.name} - ${t('teamDetail.meta.title')}` : t('teamDetail.meta.title')
)

const seoDescription = computed(() =>
  team.value
    ? t('teamDetail.meta.description', {
      name: team.value.name,
      count: team.value.teamData?.length || 0
    })
    : t('teamDetail.meta.defaultDescription')
)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'article',
  twitterCard: 'summary',
  robots: 'noindex, nofollow'
})

</script>

<template>
  <div>
    <PageContainer :showBreadcrumb="false" maxWidth="full">
      <ClientOnly>
        <!-- 团队未找到 -->
        <p v-if="loadError" role="alert" class="text-red-600">{{ t('common.error.loadingTeams') }}</p>
        <TeamNotFound v-else-if="!team && !pending" :team-id="teamId" />

        <!-- 加载中 -->
        <LoadingSpinner v-else-if="pending" :message="$t('common.loading.default')" />

        <!-- 团队详情 -->
        <div v-else-if="team">
          <!-- 团队标题区域 -->
          <TeamHeader :team="team" :use-translation="useTranslation" :get-game-version-label="getGameVersionLabel"
            :get-rules-label="getRulesLabel" @update:use-translation="useTranslation = $event">
            <!-- Tab 导航插槽 -->
            <template #tabs>
              <slot name="tabs" :active-tab="activeTab" :handle-tab-change="handleTabChange" />
            </template>
          </TeamHeader>

          <!-- 主要内容 -->
          <main>
            <!-- 验证错误组件 -->
            <TeamValidationErrors v-if="team.errors && team.errors.length > 0" :errors="team.errors"
              :show-edit-button="showEditButton" @edit="showEditModal = true" />

            <!-- 内容插槽 -->
            <slot :team="team" :translate-name="translateName" :use-translation="useTranslation" :pending="pending" />
          </main>
        </div>

        <!-- 服务端渲染时的占位符 -->
        <template #fallback>
          <LoadingSpinner :message="$t('common.loading.default')" />
        </template>
      </ClientOnly>
    </PageContainer>

    <!-- 编辑模态框 -->
    <TeamEditModal v-if="showEditButton" :saving="saving" :error="saveError" :is-open="showEditModal" mode="edit" :team="team"
      @close="showEditModal = false" @update="handleTeamUpdate" />
  </div>
</template>
