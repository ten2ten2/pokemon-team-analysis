/**
 * Composable for managing cookie consent state
 * This handles the cookie consent banner logic and provides
 * reactive state for consent status throughout the application
 */
export const useCookieConsent = () => {
  const cookieOptions = {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    default: () => null as boolean | null,
    serializer: {
      read: (value: string) => {
        if (value === 'true') return true
        if (value === 'false') return false
        return null
      },
      write: (value: boolean | null) => String(value)
    },
    // Only access cookies on client-side to prevent hydration mismatch
    server: false
  }

  const consent = useCookie('cookie_consent', cookieOptions)

  // Update Google Analytics consent based on user choice
  const updateGoogleAnalyticsConsent = (consentValue: boolean | null) => {
    if (import.meta.client) {
      // Only access useGtag on client-side to prevent hydration issues
      try {
        const { gtag } = useGtag()

        if (consentValue === true) {
          // User explicitly accepted - grant all consent
          gtag('consent', 'update', {
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            ad_storage: 'granted',
            analytics_storage: 'granted'
          })
        } else if (consentValue === false) {
          // User explicitly declined - deny all consent
          gtag('consent', 'update', {
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            ad_storage: 'denied',
            analytics_storage: 'denied'
          })
        }
        // If consentValue is null (no choice made), keep default consent state
        // which is already set in nuxt.config.ts
      } catch (error) {
        // Fallback: if useGtag is not available, log the error
        console.warn('useGtag not available:', error)
      }
    }
  }

  // Watch for consent changes and update Google Analytics accordingly
  // Use nextTick to ensure this runs after hydration
  if (import.meta.client) {
    watch(consent, (newValue) => {
      updateGoogleAnalyticsConsent(newValue)
    }, { immediate: true })
  }

  // Ensure computed properties return consistent values during SSR
  const hasConsent = computed(() => {
    // During SSR, always return false to prevent hydration mismatch
    if (import.meta.server) return false
    return consent.value !== null
  })

  const isAccepted = computed(() => {
    // During SSR, always return false to prevent hydration mismatch
    if (import.meta.server) return false
    return consent.value === true
  })

  const isDeclined = computed(() => {
    // During SSR, always return false to prevent hydration mismatch
    if (import.meta.server) return false
    return consent.value === false
  })

  return {
    consent: readonly(consent),
    hasConsent,
    isAccepted,
    isDeclined,
    accept: () => {
      consent.value = true
      // Trigger update immediately when user accepts
      if (import.meta.client) {
        updateGoogleAnalyticsConsent(true)
      }
    },
    decline: () => {
      consent.value = false
      // Trigger update immediately when user declines
      if (import.meta.client) {
        updateGoogleAnalyticsConsent(false)
      }
    },
    reset: () => {
      consent.value = null
      // Trigger update immediately when user resets
      if (import.meta.client) {
        updateGoogleAnalyticsConsent(null)
      }
    }
  }
}
