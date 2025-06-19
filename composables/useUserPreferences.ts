interface UserPreferences {
  useTranslation: boolean
}

const PREFERENCES_KEY = 'pokemon-team-analysis-preferences'
const DEFAULT_PREFERENCES: UserPreferences = {
  useTranslation: false
}

// 安全的 localStorage 操作
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!import.meta.client) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('localStorage.getItem failed:', error)
      return null
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!import.meta.client) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn('localStorage.setItem failed:', error)
      return false
    }
  }
}

export const useUserPreferences = () => {
  const { locale } = useI18n()
  const isHydrated = ref(false)

  // 加载用户偏好设置
  const loadPreferences = (): UserPreferences => {
    const stored = safeLocalStorage.getItem(PREFERENCES_KEY)
    if (!stored) return { ...DEFAULT_PREFERENCES }

    try {
      const parsed = JSON.parse(stored) as Partial<UserPreferences>
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed
      }
    } catch (error) {
      console.warn('Failed to parse user preferences:', error)
      return { ...DEFAULT_PREFERENCES }
    }
  }

  // 保存用户偏好设置
  const savePreferences = (preferences: UserPreferences): boolean => {
    try {
      return safeLocalStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save user preferences:', error)
      return false
    }
  }

  // 响应式偏好设置
  const preferences = ref<UserPreferences>(loadPreferences())

  // 只在客户端设置为已水合
  onMounted(() => {
    if (import.meta.client) {
      isHydrated.value = true
    }
  })

  // 监听偏好设置变化并自动保存
  watch(preferences, (newPreferences) => {
    savePreferences(newPreferences)
  }, { deep: true })

  // 计算属性：在英文环境下永远返回false，但只在客户端水合后才应用此逻辑
  const effectivePreferences = computed(() => {
    // 在服务端渲染或未水合时，直接返回原始偏好设置以避免hydration mismatch
    if (!isHydrated.value) {
      return preferences.value
    }

    return {
      ...preferences.value,
      useTranslation: locale.value === 'en' ? false : preferences.value.useTranslation
    }
  })

  // 更新翻译开关 - 在英文环境下不生效，但只在客户端检查
  const setUseTranslation = (value: boolean) => {
    // 只在客户端水合后才检查语言环境
    if (isHydrated.value && locale.value === 'en') {
      // 在英文环境下不允许设置翻译开关
      return
    }
    preferences.value.useTranslation = value
  }

  // 重置所有偏好设置
  const resetPreferences = () => {
    preferences.value = { ...DEFAULT_PREFERENCES }
  }

  return {
    preferences: readonly(effectivePreferences),
    isHydrated: readonly(isHydrated),
    setUseTranslation,
    resetPreferences
  }
}
