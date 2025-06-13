<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
  isEllipsis?: boolean
}

interface Props {
  items?: BreadcrumbItem[]
  separator?: 'chevron' | 'slash' | 'arrow'
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  separator: 'chevron',
  maxItems: 5
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

// Generate breadcrumb items from route if not provided
const breadcrumbItems = computed(() => {
  if (props.items.length > 0) {
    return props.items
  }

  // Auto-generate from route
  // Remove locale prefix from path for breadcrumb generation
  const cleanPath = route.path.replace(/^\/[a-z]{2}(-[a-z]{2,4})?/, '') || '/'
  const pathSegments = cleanPath.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  // Generate items from path segments
  let currentPath = ''
  pathSegments.forEach((segment: string, index: number) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1

    // Try to get translated label, fallback to formatted segment
    const labelKey = `nav.${segment}`
    let label = t(labelKey, '')

    if (!label) {
      // Format segment as fallback (kebab-case to Title Case)
      label = segment
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    items.push({
      label,
      href: isLast ? undefined : localePath(currentPath),
      isCurrentPage: isLast
    })
  })

  return items
})
</script>

<template>
  <nav v-if="breadcrumbItems.length > 0" class="breadcrumb-nav" aria-label="Breadcrumb navigation" role="navigation">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb list with flex layout to keep items in one line -->
      <ol class="flex items-center min-w-0" itemscope itemtype="https://schema.org/BreadcrumbList">
        <!-- Home -->
        <li class="flex items-center flex-shrink-0">
          <NuxtLinkLocale :to="localePath('/')"
            class="text-gray-600 hover:text-red-600 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-50"
            itemprop="item">
            <Home class="w-5 h-5" />
          </NuxtLinkLocale>
        </li>

        <!-- Items -->
        <li v-for="(item, index) in breadcrumbItems" :key="`${item.label}-${index}`" class="flex items-center min-w-0"
          :class="{
            'breadcrumb-item--current': item.isCurrentPage,
            'breadcrumb-item--ellipsis': item.isEllipsis
          }" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">

          <!-- Separator -->
          <span class="breadcrumb-separator flex-shrink-0 mx-0.5" aria-hidden="true">
            <ChevronRight v-if="separator === 'chevron'" class="w-4 h-4 text-gray-400" />
            <ArrowRight v-else-if="separator === 'arrow'" class="w-4 h-4 text-gray-400" />
            <span v-else class="text-gray-400">/</span>
          </span>

          <!-- Ellipsis item -->
          <span v-if="item.isEllipsis" class="breadcrumb-ellipsis flex-shrink-0" aria-hidden="true">
            {{ item.label }}
          </span>

          <!-- Current page (no link) -->
          <span v-else-if="item.isCurrentPage" class="breadcrumb-current truncate" aria-current="page" itemprop="name"
            :title="item.label">
            {{ item.label }}
          </span>

          <!-- Linked item -->
          <NuxtLinkLocale v-else :to="item.href!" class="breadcrumb-link truncate" itemprop="item" :title="item.label">
            <span itemprop="name">{{ item.label }}</span>
          </NuxtLinkLocale>

          <!-- Hidden structured data -->
          <meta v-if="!item.isEllipsis && !item.isCurrentPage" itemprop="position" :content="String(index + 1)">
        </li>
      </ol>
    </div>
  </nav>
</template>
