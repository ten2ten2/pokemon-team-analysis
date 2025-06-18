<script setup lang="ts">
interface TabItem {
  key: string
  label: string
  to?: string
  disabled?: boolean
}

interface Props {
  tabs: TabItem[]
  activeTab?: string
  teamId?: string
}

interface Emits {
  (e: 'change', tab: string): void
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: ''
})

const emit = defineEmits<Emits>()

const handleTabClick = (tab: TabItem) => {
  if (tab.disabled) return

  if (tab.to) {
    // 如果有 to 属性，使用路由导航
    return
  }

  // 否则触发事件
  emit('change', tab.key)
}

const getTabClasses = (tab: TabItem, isActive: boolean) => {
  const baseClasses = 'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200'

  if (tab.disabled) {
    return `${baseClasses} border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed`
  }

  if (isActive) {
    return `${baseClasses} border-red-400 text-red-600 dark:text-red-400`
  }

  return `${baseClasses} border-transparent text-gray-500 hover:text-red-600 hover:border-red-300 dark:text-gray-400 dark:hover:text-red-400`
}
</script>

<template>
  <nav class="border-b border-gray-200 dark:border-gray-700" role="tablist">
    <div class="-mb-px flex space-x-8">
      <template v-for="tab in tabs" :key="tab.key">
        <!-- 路由链接 Tab -->
        <NuxtLinkLocale v-if="tab.to" :to="tab.to" role="tab" :class="getTabClasses(tab, false)"
          :aria-disabled="tab.disabled">
          {{ tab.label }}
        </NuxtLinkLocale>

        <!-- 普通按钮 Tab -->
        <button v-else type="button" role="tab" :aria-selected="activeTab === tab.key"
          :tabindex="activeTab === tab.key ? 0 : -1" :disabled="tab.disabled"
          :class="getTabClasses(tab, activeTab === tab.key)" @click="handleTabClick(tab)">
          {{ tab.label }}
        </button>
      </template>
    </div>
  </nav>
</template>
