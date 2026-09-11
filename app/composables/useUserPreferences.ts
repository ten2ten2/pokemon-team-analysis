const PREFERENCES_KEY = 'pokemon-team-analysis-preferences'

export const useUserPreferences = () => {
  const { locale } = useI18n()
  const useTranslation = useState('translate-pokemon-names', () => false)
  const loaded = useState('preferences-loaded', () => false)

  onMounted(() => {
    if (loaded.value) return
    try {
      const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? 'null')
      useTranslation.value = stored?.useTranslation === true
    } catch (error) {
      console.warn('Could not load display preferences:', error)
    }
    loaded.value = true
  })

  const setUseTranslation = (value: boolean) => {
    useTranslation.value = value
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ useTranslation: value }))
    } catch (error) {
      console.warn('Could not save display preferences:', error)
    }
  }

  return {
    preferences: computed(() => ({ useTranslation: locale.value !== 'en' && useTranslation.value })),
    setUseTranslation,
  }
}
