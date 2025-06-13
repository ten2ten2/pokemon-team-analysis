<script setup lang="ts">
import { ref, computed } from 'vue'

const { locales, locale, setLocale } = useI18n()
const isOpen = ref(false)

// Define emit for notifying parent component
const emit = defineEmits<{
  languageChanged: []
}>()

const handleLocaleChange = (newLocale: string) => {
  setLocale(newLocale as typeof locales.value[number]['code'])
  isOpen.value = false
  // Emit event to notify parent component (Header) to close mobile menu
  emit('languageChanged')
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const currentLocale = computed(() => {
  return locales.value.find((l: any) => l.code === locale.value)
})
</script>

<template>
  <div class="relative">
    <!-- Desktop Dropdown -->
    <div class="hidden sm:block">
      <button @click="toggleDropdown" class="language-btn" :aria-expanded="isOpen" aria-haspopup="true"
        aria-label="Select language">
        <Globe class="w-4 h-4" />
        <span>{{ currentLocale?.name }}</span>
        <ChevronDown :class="['w-4 h-4 transition-transform duration-200', isOpen ? 'rotate-180' : '']" />
      </button>
      <!-- Dropdown Menu -->
      <div v-show="isOpen"
        class="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50" role="menu"
        aria-orientation="vertical">
        <button v-for="l in locales" :key="l.code" @click="handleLocaleChange(l.code)" :class="[
          l.code === locale
            ? 'language-option-active'
            : 'language-option-inactive'
        ]" role="menuitem">
          {{ l.name }}
        </button>
      </div>
    </div>

    <!-- Mobile Select -->
    <div class="sm:hidden">
      <select :value="locale" @change="handleLocaleChange(($event.target as HTMLSelectElement).value)"
        class="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
        aria-label="Select language">
        <option v-for="l in locales" :key="l.code" :value="l.code" :selected="l.code === locale">
          {{ l.name }}
        </option>
      </select>
    </div>
  </div>
</template>
