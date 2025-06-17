import type { SelectOption } from '~/types/team'
import { GAME_VERSIONS, RULES } from '~/types/team'

export const useTeamOptions = () => {
  const { t } = useI18n()

  // Game version options - use computed to ensure translations are loaded
  const gameVersionOptions = computed((): SelectOption[] => [
    { value: GAME_VERSIONS.SV, label: t('common.gameVersion.options.sv') }
  ])

  // Rules options - use computed to ensure translations are loaded
  const rulesOptions = computed((): SelectOption[] => [
    { value: RULES.DOUBLES_REG_G, label: t('common.rules.options.doublesRegG') },
    { value: RULES.DOUBLES_REG_H, label: t('common.rules.options.doublesRegH') },
    { value: RULES.DOUBLES_REG_I, label: t('common.rules.options.doublesRegI') },
    { value: RULES.SINGLES_REG_G, label: t('common.rules.options.singlesRegG') },
    { value: RULES.SINGLES_REG_H, label: t('common.rules.options.singlesRegH') },
    { value: RULES.SINGLES_REG_I, label: t('common.rules.options.singlesRegI') }
  ])

  return {
    gameVersionOptions,
    rulesOptions
  }
}
