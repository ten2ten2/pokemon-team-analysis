import type { SelectOption } from '~/types/team'
import { GAME_VERSIONS, RULES } from '~/types/team'

export const useTeamOptions = () => {
  // 确保在组件上下文中调用 useI18n
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useTeamOptions must be called within a component setup function')
  }

  const { t } = useI18n()

  // Game version options - use computed to ensure translations are loaded
  const gameVersionOptions = computed((): SelectOption[] => {
    try {
      return [
        { value: GAME_VERSIONS.SV, label: t('common.gameVersion.options.sv') }
      ]
    } catch (error) {
      console.warn('Failed to load game version options:', error)
      return [
        { value: GAME_VERSIONS.SV, label: 'Scarlet / Violet' }
      ]
    }
  })

  // Rules options - use computed to ensure translations are loaded
  const rulesOptions = computed((): SelectOption[] => {
    try {
      return [
        { value: RULES.DOUBLES_REG_G, label: t('common.rules.options.doublesRegG') },
        { value: RULES.DOUBLES_REG_H, label: t('common.rules.options.doublesRegH') },
        { value: RULES.DOUBLES_REG_I, label: t('common.rules.options.doublesRegI') },
        { value: RULES.SINGLES_REG_G, label: t('common.rules.options.singlesRegG') },
        { value: RULES.SINGLES_REG_H, label: t('common.rules.options.singlesRegH') },
        { value: RULES.SINGLES_REG_I, label: t('common.rules.options.singlesRegI') }
      ]
    } catch (error) {
      console.warn('Failed to load rules options:', error)
      return [
        { value: RULES.DOUBLES_REG_G, label: 'Doubles, Regulation G' },
        { value: RULES.DOUBLES_REG_H, label: 'Doubles, Regulation H' },
        { value: RULES.DOUBLES_REG_I, label: 'Doubles, Regulation I' },
        { value: RULES.SINGLES_REG_G, label: 'Singles, Regulation G' },
        { value: RULES.SINGLES_REG_H, label: 'Singles, Regulation H' },
        { value: RULES.SINGLES_REG_I, label: 'Singles, Regulation I' }
      ]
    }
  })

  return {
    gameVersionOptions,
    rulesOptions
  }
}
