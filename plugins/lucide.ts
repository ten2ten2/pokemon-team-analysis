import { defineNuxtPlugin } from 'nuxt/app'
import { XIcon, Globe, ChevronDown, ChevronRight, ArrowRight, Menu, X, Home } from 'lucide-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('XIcon', XIcon)
  nuxtApp.vueApp.component('Globe', Globe)
  nuxtApp.vueApp.component('ChevronDown', ChevronDown)
  nuxtApp.vueApp.component('ChevronRight', ChevronRight)
  nuxtApp.vueApp.component('ArrowRight', ArrowRight)
  nuxtApp.vueApp.component('Menu', Menu)
  nuxtApp.vueApp.component('X', X)
  nuxtApp.vueApp.component('Home', Home)
})
