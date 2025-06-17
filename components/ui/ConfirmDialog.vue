<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'info'
})

const emit = defineEmits<Emits>()

// Client-side hydration state
const isClient = ref(false)

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    handleCancel()
  }
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (target.classList.contains('modal-overlay')) {
    handleCancel()
  }
}

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

// Ensure we're on client side before DOM operations
onMounted(() => {
  isClient.value = true
})

// Watch for modal open/close to handle keyboard events
watch(() => props.isOpen, (isOpen) => {
  if (isClient.value && import.meta.client) {
    nextTick(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleEscape)
      } else {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleEscape)
      }
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (isClient.value && import.meta.client) {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
  }
})

// Computed classes for different variants
const iconClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'text-red-600 dark:text-red-400'
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-blue-600 dark:text-blue-400'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'btn-primary bg-red-500 hover:bg-red-600 focus:bg-red-600'
    case 'warning':
      return 'btn-primary bg-yellow-500 hover:bg-yellow-600 focus:bg-yellow-600'
    default:
      return 'btn-primary'
  }
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="isOpen" class="modal-overlay" @click="handleClickOutside">
          <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-300"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="isOpen"
              class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4"
              role="dialog" aria-modal="true" :aria-labelledby="`confirm-title`" :aria-describedby="`confirm-message`">

              <!-- Dialog Content -->
              <div class="p-6">
                <!-- Icon and Title -->
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" :class="variant === 'danger' ? 'bg-red-100 dark:bg-red-900/20' :
                    variant === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      'bg-blue-100 dark:bg-blue-900/20'">
                    <Trash2 v-if="variant === 'danger'" class="w-5 h-5" :class="iconClass" aria-hidden="true" />
                    <AlertTriangle v-else-if="variant === 'warning'" class="w-5 h-5" :class="iconClass"
                      aria-hidden="true" />
                    <AlertCircle v-else class="w-5 h-5" :class="iconClass" aria-hidden="true" />
                  </div>
                  <h2 id="confirm-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ title }}
                  </h2>
                </div>

                <!-- Message -->
                <p id="confirm-message" class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {{ message }}
                </p>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-3">
                  <button @click="handleCancel" class="btn-secondary focus-ring-gray" type="button">
                    {{ cancelText }}
                  </button>
                  <button @click="handleConfirm" :class="confirmButtonClass" class="focus-ring-red" type="button">
                    {{ confirmText }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>
