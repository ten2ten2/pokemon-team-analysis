<script setup lang="ts">
import { NuxtLinkLocale } from '#components'
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigation, type NavItem } from '~/composables/useNavigation'

const { t } = useI18n()
const { navItems } = useNavigation()

// Mobile menu state
const isMobileMenuOpen = ref(false)
const activeDropdown = ref<string | null>(null)

// Handle mobile menu toggle
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (import.meta.client) {
    if (isMobileMenuOpen.value) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      activeDropdown.value = null
    }
  }
}

// Handle dropdown toggle
const toggleDropdown = (itemId: string) => {
  activeDropdown.value = activeDropdown.value === itemId ? null : itemId
}

// Handle navigation click (for modal and other non-link items)
const handleNavClick = (item: NavItem) => {
  if (item.type === 'modal' && item.modal) {
    // Handle modal opening - you can implement this based on your modal system
    console.log('Open modal:', item.modal)
    closeMobileMenu()
  }
}

// Close mobile menu
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
  activeDropdown.value = null
}

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (activeDropdown.value) {
      activeDropdown.value = null
    } else if (isMobileMenuOpen.value) {
      closeMobileMenu()
    }
  }
}

// Handle click outside (for mobile menu only, desktop uses hover)
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.mobile-menu')) {
    // Only close mobile menu dropdowns on click outside
    if (isMobileMenuOpen.value && !target.closest('.dropdown-container')) {
      activeDropdown.value = null
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('click', handleClickOutside)
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <div class="flex-shrink-0">
          <NuxtLinkLocale to="/" class="header-title flex items-center space-x-2 text-xl font-bold"
            aria-label="Go to homepage">
            <span class="text-red-500">{{ t('home.meta.title') }}</span>
          </NuxtLinkLocale>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
          <ul class="flex items-center space-x-8">
            <li v-for="item in navItems" :key="item.id" class="relative">
              <!-- Dropdown Navigation Item -->
              <div v-if="item.type === 'dropdown'" class="dropdown-container relative"
                @mouseenter="activeDropdown = item.id" @mouseleave="activeDropdown = null">
                <div v-if="!item.hasOwnLink" class="flex items-center space-x-1 nav-link-with-padding cursor-pointer"
                  :aria-expanded="activeDropdown === item.id" :aria-haspopup="true"
                  :aria-controls="`dropdown-${item.id}`">
                  <span>{{ t(item.labelKey) }}</span>
                  <ChevronDown
                    :class="['w-4 h-4 transition-transform duration-200', activeDropdown === item.id ? 'rotate-180' : '']" />
                </div>

                <div v-else class="flex items-center">
                  <NuxtLinkLocale :to="item.href!" class="nav-link-with-padding">
                    {{ t(item.labelKey) }}
                  </NuxtLinkLocale>
                  <span class="ml-1 p-1 text-gray-700">
                    <ChevronDown
                      :class="['w-4 h-4 transition-transform duration-200', activeDropdown === item.id ? 'rotate-180' : '']" />
                  </span>
                </div>

                <!-- Dropdown Menu -->
                <div v-show="activeDropdown === item.id" :id="`dropdown-${item.id}`"
                  class="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                  role="menu" :aria-labelledby="`dropdown-button-${item.id}`">
                  <NuxtLinkLocale v-for="child in item.children" :key="child.id" :to="child.href!" class="dropdown-item"
                    role="menuitem" @click="activeDropdown = null">
                    {{ t(child.labelKey) }}
                  </NuxtLinkLocale>
                </div>
              </div>

              <!-- Regular Navigation Item -->
              <template v-else>
                <NuxtLinkLocale v-if="item.type === 'internal'" :to="item.href!" class="nav-link-with-padding">
                  {{ t(item.labelKey) }}
                </NuxtLinkLocale>

                <NuxtLink v-else-if="item.type === 'external'" :to="item.href!" external target="_blank"
                  class="nav-link-with-padding">
                  {{ t(item.labelKey) }}
                </NuxtLink>

                <button v-else @click="handleNavClick(item)" class="nav-link-with-padding">
                  {{ t(item.labelKey) }}
                </button>
              </template>
            </li>
          </ul>
        </nav>

        <!-- Desktop Language Switcher & Mobile Menu Button -->
        <div class="flex items-center space-x-4">
          <!-- Language Switcher -->
          <div class="hidden sm:block">
            <LanguageSwitcher @language-changed="closeMobileMenu" />
          </div>

          <!-- Mobile Menu Button -->
          <button @click="toggleMobileMenu" class="mobile-menu-btn" :aria-expanded="isMobileMenuOpen"
            aria-controls="mobile-menu" aria-label="Toggle mobile menu">
            <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <div v-show="isMobileMenuOpen" id="mobile-menu"
      class="md:hidden mobile-menu bg-white border-t border-gray-200 shadow-lg" role="navigation"
      aria-label="Mobile navigation">
      <div class="px-4 py-2 space-y-1">
        <!-- Mobile Language Switcher -->
        <div class="sm:hidden py-2 border-b border-gray-200 mb-2">
          <div class="flex items-center space-x-2">
            <Globe class="w-4 h-4 text-gray-500" />
            <LanguageSwitcher @language-changed="closeMobileMenu" />
          </div>
        </div>

        <!-- Mobile Navigation Items -->
        <div v-for="item in navItems" :key="item.id" class="space-y-1">
          <!-- Dropdown in Mobile -->
          <div v-if="item.type === 'dropdown'">
            <div class="flex items-center">
              <!-- If has own link, show as separate clickable area -->
              <NuxtLinkLocale v-if="item.hasOwnLink" :to="item.href!" class="flex-1 mobile-nav-item"
                @click="closeMobileMenu">
                {{ t(item.labelKey) }}
              </NuxtLinkLocale>

              <!-- If no own link, show as non-clickable text -->
              <span v-else class="flex-1 block px-3 py-2 text-base font-medium text-gray-700">
                {{ t(item.labelKey) }}
              </span>

              <!-- Dropdown toggle button -->
              <button @click="toggleDropdown(item.id)" class="dropdown-toggle"
                :aria-expanded="activeDropdown === item.id" :aria-label="`Toggle ${t(item.labelKey)} submenu`">
                <ChevronDown
                  :class="['w-4 h-4 transition-transform duration-200', activeDropdown === item.id ? 'rotate-180' : '']" />
              </button>
            </div>

            <!-- Mobile Dropdown Items -->
            <div v-show="activeDropdown === item.id" class="pl-4 space-y-1">
              <NuxtLinkLocale v-for="child in item.children" :key="child.id" :to="child.href!"
                class="mobile-dropdown-item" @click="closeMobileMenu">
                {{ t(child.labelKey) }}
              </NuxtLinkLocale>
            </div>
          </div>

          <!-- Regular Mobile Navigation Item -->
          <template v-else>
            <NuxtLinkLocale v-if="item.type === 'internal'" :to="item.href!" class="mobile-nav-item"
              @click="closeMobileMenu">
              {{ t(item.labelKey) }}
            </NuxtLinkLocale>

            <NuxtLink v-else-if="item.type === 'external'" :to="item.href!" external target="_blank"
              class="mobile-nav-item" @click="closeMobileMenu">
              {{ t(item.labelKey) }}
            </NuxtLink>

            <button v-else @click="handleNavClick(item)" class="w-full text-left mobile-nav-item">
              {{ t(item.labelKey) }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
