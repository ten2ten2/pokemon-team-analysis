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
  // 获取当前语言环境
  const { locale } = useI18n()

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

  // 监听偏好设置变化并自动保存
  watch(preferences, (newPreferences) => {
    savePreferences(newPreferences)
  }, { deep: true })

  // 实际的翻译开关状态 - 英语环境下永远为 false
  const effectiveUseTranslation = computed(() => {
    return locale.value !== 'en' && preferences.value.useTranslation
  })

  // 更新翻译开关
  const setUseTranslation = (value: boolean) => {
    // 英语环境下不允许开启翻译
    if (locale.value === 'en') {
      preferences.value.useTranslation = false
      return
    }
    preferences.value.useTranslation = value
  }

  // 重置所有偏好设置
  const resetPreferences = () => {
    preferences.value = { ...DEFAULT_PREFERENCES }
  }

  return {
    preferences: readonly(preferences),
    effectiveUseTranslation: readonly(effectiveUseTranslation),
    setUseTranslation,
    resetPreferences
  }
}
