import { defineNuxtPlugin } from 'nuxt/app'
import {
  XIcon,
  Globe,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Home,
  Gamepad2,
  FileText,
  Calendar,
  Edit3,
  Trash2,
  Check,
  Plus,
  Loader2
} from 'lucide-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('XIcon', XIcon)
  nuxtApp.vueApp.component('Globe', Globe)
  nuxtApp.vueApp.component('ChevronDown', ChevronDown)
  nuxtApp.vueApp.component('ChevronRight', ChevronRight)
  nuxtApp.vueApp.component('ArrowRight', ArrowRight)
  nuxtApp.vueApp.component('Menu', Menu)
  nuxtApp.vueApp.component('X', X)
  nuxtApp.vueApp.component('Home', Home)
  nuxtApp.vueApp.component('Gamepad2', Gamepad2)
  nuxtApp.vueApp.component('FileText', FileText)
  nuxtApp.vueApp.component('Calendar', Calendar)
  nuxtApp.vueApp.component('Edit3', Edit3)
  nuxtApp.vueApp.component('Trash2', Trash2)
  nuxtApp.vueApp.component('Check', Check)
  nuxtApp.vueApp.component('Plus', Plus)
  nuxtApp.vueApp.component('Loader2', Loader2)
})
