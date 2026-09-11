import type { TranslationData } from '#shared/types/translations'
import { normalizeName } from '~/lib/core/utils'

const typeMap = {
  species: 'species', ability: 'abilities', move: 'moves', item: 'items', type: 'types',
} as const

export const usePokemonTranslations = () => {
  const { locale } = useI18n()
  const { data, status } = useFetch<TranslationData>('/api/pokemon-translations', {
    key: 'pokemon-translations', server: false, lazy: true,
  })

  const getTranslatedName = (
    name: string,
    type: keyof typeof typeMap = 'species',
    enabled = true,
  ): string => {
    if (!enabled || !name || !data.value) return name
    const entries = data.value[typeMap[type]]
    const normalized = normalizeName(name).replace(/^the-/, '')
    return entries[normalized]?.[locale.value]
      ?? entries[name.toLowerCase()]?.[locale.value]
      ?? (type === 'ability' ? entries[normalized.replace(/-/g, '')]?.[locale.value] : undefined)
      ?? name
  }

  return { getTranslatedName, isLoading: computed(() => status.value === 'pending') }
}
