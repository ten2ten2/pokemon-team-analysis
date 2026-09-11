<script setup lang="ts">
import { Menu, X } from '@lucide/vue'

const { t } = useI18n()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const navItems = [
  { href: '/about', label: 'nav.about' },
  { href: '/resources', label: 'nav.resources' },
]
const closeMobileMenu = () => { isMobileMenuOpen.value = false }
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMobileMenu()
}
watch(() => route.fullPath, closeMobileMenu)
watch(isMobileMenuOpen, open => { document.body.style.overflow = open ? 'hidden' : '' })
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center gap-4">
        <NuxtLinkLocale to="/" class="header-title text-xl font-bold text-red-500">
          {{ t('home.meta.title') }}
        </NuxtLinkLocale>
        <nav class="ml-8 hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <NuxtLinkLocale v-for="item in navItems" :key="item.href" :to="item.href" class="nav-link">
            {{ t(item.label) }}
          </NuxtLinkLocale>
        </nav>
        <div class="ml-auto flex items-center gap-2">
          <LanguageSwitcher @language-changed="closeMobileMenu" />
          <button class="mobile-menu-btn" type="button" aria-label="Toggle navigation"
            aria-controls="mobile-navigation" :aria-expanded="isMobileMenuOpen"
            @click="isMobileMenuOpen = !isMobileMenuOpen">
            <X v-if="isMobileMenuOpen" class="size-5" />
            <Menu v-else class="size-5" />
          </button>
        </div>
      </div>
    </div>
    <nav v-if="isMobileMenuOpen" id="mobile-navigation" class="mobile-menu" aria-label="Mobile navigation">
      <NuxtLinkLocale v-for="item in navItems" :key="item.href" :to="item.href" class="mobile-nav-item"
        @click="closeMobileMenu">
        {{ t(item.label) }}
      </NuxtLinkLocale>
    </nav>
  </header>
</template>
