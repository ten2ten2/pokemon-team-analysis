export const useCookieConsent = () => {
  const consent = useCookie<boolean | null>('cookie_consent', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })
  const { gtag, initialize, enableAnalytics, disableAnalytics } = useGtag()

  const applyConsent = () => {
    if (consent.value === true) {
      initialize()
      enableAnalytics()
    } else {
      disableAnalytics()
    }
    gtag('consent', 'update', {
      analytics_storage: consent.value === true ? 'granted' : 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      ad_storage: 'denied',
    })
  }

  onMounted(applyConsent)
  watch(consent, applyConsent)

  return {
    hasConsent: computed(() => consent.value !== null),
    accept: () => { consent.value = true },
    decline: () => { consent.value = false },
  }
}
