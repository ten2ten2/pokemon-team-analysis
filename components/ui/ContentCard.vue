<script setup lang="ts">
interface Props {
  title?: string
  content?: string
  containerClass?: string
  headerClass?: string
  titleClass?: string
  contentClass?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  content: '',
  containerClass: '',
  headerClass: '',
  titleClass: '',
  contentClass: ''
})
</script>

<template>
  <div :class="[
    'bg-white dark:bg-gray-800 shadow-sm rounded-lg',
    containerClass
  ]">
    <!-- Header slot -->
    <header v-if="$slots.header || title" :class="[
      'pt-6 sm:pt-8 px-6 sm:px-8',
      headerClass,
      { 'mb-6': $slots.default || content }
    ]">
      <slot name="header">
        <h2 v-if="title" :class="[
          'text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white',
          titleClass
        ]">
          {{ title }}
        </h2>
      </slot>
    </header>

    <!-- Content slot -->
    <div v-if="$slots.default || content" :class="[
      'px-6 sm:px-8',
      $slots.header || title ? 'pb-6 sm:pb-8' : 'py-6 sm:py-8',
      contentClass
    ]">
      <slot>
        <div v-if="content" v-html="content" />
      </slot>
    </div>
  </div>
</template>
