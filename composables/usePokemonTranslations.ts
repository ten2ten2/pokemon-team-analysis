interface TranslationData {
  species: Record<string, Record<string, string>>
  abilities: Record<string, Record<string, string>>
  moves: Record<string, Record<string, string>>
  items: Record<string, Record<string, string>>
  types: Record<string, Record<string, string>>
}

export const usePokemonTranslations = () => {
  const { locale } = useI18n()

  // 翻译数据版本（修改此版本号可强制刷新缓存）
  const TRANSLATION_VERSION = '1.2'

  // 翻译数据缓存
  const translationData = ref<TranslationData>({
    species: {},
    abilities: {},
    moves: {},
    items: {},
    types: {}
  })

  // 加载状态
  const isLoading = ref(false)
  const isLoaded = ref(false)

  // 加载翻译数据
  const loadTranslations = async (): Promise<void> => {
    if (isLoaded.value || isLoading.value || !import.meta.client) {
      return
    }

    isLoading.value = true

    try {
      const response = await fetch(`/api/pokemon-translations?v=${TRANSLATION_VERSION}`)
      if (response.ok) {
        const data = await response.json()
        translationData.value = data
        isLoaded.value = true
      }
    } catch (error) {
      console.warn('Failed to load translation data:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 获取翻译后的名称
  const getTranslatedName = (
    originalName: string,
    type: 'species' | 'ability' | 'move' | 'item' | 'type' = 'species',
    useTranslationFlag: boolean = true
  ): string => {
    if (!useTranslationFlag || !originalName || !isLoaded.value) {
      return originalName
    }

    // 标准化名称为小写并移除特殊字符
    const normalizedName = originalName.toLowerCase()
      .replace(/\s*-\s*/g, '-') // 把「多个空格 + 连字符 + 多个空格」都统一替换成单个连字符
      .replace(/[^a-z0-9 \-]/g, '') // 移除所有非字母、数字、空格和连字符的字符
      .replace(/ +/g, '-') // 将所有空格替换为连字符
      .replace(/^the-/, '') // 移除开头的 "the-"

    // 映射类型到数据键
    const typeMap: Record<string, keyof TranslationData> = {
      'species': 'species',
      'ability': 'abilities',
      'move': 'moves',
      'item': 'items',
      'type': 'types'
    }

    // 获取对应类型的翻译数据
    const dataKey = typeMap[type]
    const targetData = translationData.value[dataKey]

    // 尝试直接匹配
    if (targetData[normalizedName] && targetData[normalizedName][locale.value]) {
      return targetData[normalizedName][locale.value]
    }

    // 尝试匹配原始名称的小写版本
    const lowerOriginal = originalName.toLowerCase()
    if (targetData[lowerOriginal] && targetData[lowerOriginal][locale.value]) {
      return targetData[lowerOriginal][locale.value]
    }

    // 对于特性，尝试移除连字符
    if (type === 'ability') {
      const withoutHyphens = normalizedName.replace(/-/g, '')
      if (targetData[withoutHyphens] && targetData[withoutHyphens][locale.value]) {
        return targetData[withoutHyphens][locale.value]
      }
    }

    return originalName
  }

  // 自动加载翻译数据
  onMounted(() => {
    loadTranslations()
  })

  return {
    translationData: readonly(translationData),
    isLoading: readonly(isLoading),
    isLoaded: readonly(isLoaded),
    loadTranslations,
    getTranslatedName
  }
}
