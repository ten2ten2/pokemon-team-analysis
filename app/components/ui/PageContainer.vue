<script setup lang="ts">
import type { BreadcrumbItem } from '../layout/Breadcrumb.vue'

interface Props {
  pageTitle?: string
  backgroundClass?: string
  headerTitleClass?: string
  headerClass?: string
  headerContainerClass?: string
  contentSpacing?: string
  maxWidth?: 'default' | 'wide' | 'full'
  // Breadcrumb props
  showBreadcrumb?: boolean
  breadcrumbItems?: BreadcrumbItem[]
  breadcrumbSeparator?: 'chevron' | 'slash' | 'arrow'
  breadcrumbMaxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: '',
  backgroundClass: 'bg-gray-50 dark:bg-gray-900',
  headerTitleClass: '',
  headerClass: '',
  headerContainerClass: '',
  contentSpacing: 'py-8 space-y-12',
  maxWidth: 'default',
  showBreadcrumb: true,
  breadcrumbItems: () => [],
  breadcrumbSeparator: 'chevron',
  breadcrumbMaxItems: 5
})

// 计算最大宽度类
const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'wide':
      return 'max-w-7xl'
    case 'full':
      return 'max-w-full'
    default:
      return 'max-w-5xl'
  }
})
</script>

<template>
  <main :class="['flex-1', backgroundClass]">
    <!-- Breadcrumb Navigation -->
    <Breadcrumb v-if="showBreadcrumb" :items="breadcrumbItems" :separator="breadcrumbSeparator"
      :max-items="breadcrumbMaxItems" />

    <!-- Page Header -->
    <div v-if="$slots.header || pageTitle" :class="[
      maxWidthClass, 'mx-auto px-4 sm:px-6 lg:px-8',
      breadcrumbItems.length > 0 ? 'pt-2' : 'pt-8'
    ]">
      <ContentCard :title="pageTitle" :title-class="headerTitleClass" :header-class="headerClass"
        :container-class="headerContainerClass">
        <template v-if="$slots.header" #header>
          <slot name="header" />
        </template>
        <template v-if="$slots.headerContent">
          <slot name="headerContent" />
        </template>
      </ContentCard>
    </div>

    <!-- Main Content -->
    <div :class="[maxWidthClass, 'mx-auto px-4 sm:px-6 lg:px-8', contentSpacing]">
      <slot />
    </div>
  </main>
</template>
