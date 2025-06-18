<script setup lang="ts">
interface Props {
  text: string
  successMessage?: string
  buttonText?: string
  title?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  successMessage: '',
  buttonText: '',
  title: '',
  size: 'md',
  variant: 'default'
})

const { t } = useI18n()
const copySuccess = ref(false)

const displayButtonText = computed(() =>
  props.buttonText || t('teamDetail.rawData.copy')
)

const displaySuccessMessage = computed(() =>
  props.successMessage || t('teamDetail.rawData.copied')
)

const displayTitle = computed(() =>
  props.title || t('teamDetail.rawData.copyButton')
)

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

const buttonClasses = computed(() => {
  const baseClasses = `inline-flex items-center gap-2 font-medium rounded-md transition-colors focus-ring-red ${sizeClasses[props.size]}`

  if (copySuccess.value || props.variant === 'success') {
    return `${baseClasses} text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/50`
  }

  return `${baseClasses} text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700`
})

const copyToClipboard = async () => {
  if (!props.text.trim() || !import.meta.client) return

  try {
    await navigator.clipboard.writeText(props.text)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
    // 降级方案：选择文本
    try {
      const textArea = document.createElement('textarea')
      textArea.value = props.text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } catch (fallbackError) {
      console.error('Fallback copy method also failed:', fallbackError)
    }
  }
}
</script>

<template>
  <button type="button" @click="copyToClipboard" :class="buttonClasses" :title="displayTitle">
    <Check v-if="copySuccess" :class="iconSizeClasses[size]" aria-hidden="true" />
    <Copy v-else :class="iconSizeClasses[size]" aria-hidden="true" />
    <span class="hidden sm:inline">
      {{ copySuccess ? displaySuccessMessage : displayButtonText }}
    </span>
  </button>
</template>
