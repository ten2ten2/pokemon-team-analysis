import { GAME_VERSIONS, RULES } from '~/types/team'

export const useTeamOptions = () => {
  const { t } = useI18n()
  return {
    gameVersionOptions: computed(() => Object.values(GAME_VERSIONS).map(value => ({
      value, label: t(`common.gameVersion.options.${value}`),
    }))),
    rulesOptions: computed(() => Object.values(RULES).map(value => ({
      value, label: t(`common.rules.options.${value}`),
    }))),
  }
}
