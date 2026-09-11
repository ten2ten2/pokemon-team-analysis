export function useTeamTabs(teamId: MaybeRefOrGetter<string>, active: string) {
  const { t } = useI18n()
  return computed(() => ['overview', 'resistance', 'coverage', 'speedTiers', 'strategy'].map(key => ({
    key, label: t(`teamDetail.tabs.${key}`),
    disabled: key === 'speedTiers' || key === 'strategy',
    to: key === active ? undefined : `/teams/${toValue(teamId)}${key === 'overview' ? '' : `/${key}`}`,
  })))
}
