export default defineNuxtPlugin(() => {
  // This plugin handles smooth scrolling for anchor links
  // The .client.ts suffix ensures it only runs on the client side

  const handleSmoothScroll = (e: Event) => {
    e.preventDefault()
    const link = e.currentTarget as HTMLAnchorElement
    const targetId = link.getAttribute('href')

    if (targetId) {
      const target = document.querySelector(targetId)
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }

  const initSmoothScroll = () => {
    // Handle smooth scrolling for internal anchor links
    const links = document.querySelectorAll('a[href^="#"]')

    links.forEach(link => {
      link.addEventListener('click', handleSmoothScroll)
    })

    return () => {
      // Cleanup function
      links.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll)
      })
    }
  }

  // Initialize when DOM is ready
  let cleanup: (() => void) | null = null

  // Use process.client to ensure we're on client side
  if (process.client) {
    // Initialize immediately if DOM is already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        cleanup = initSmoothScroll()
      })
    } else {
      cleanup = initSmoothScroll()
    }

    // Also reinitialize when navigating to new pages
    const router = useRouter()
    router.afterEach(() => {
      nextTick(() => {
        if (cleanup) cleanup()
        cleanup = initSmoothScroll()
      })
    })

    // Cleanup when page unloads
    window.addEventListener('beforeunload', () => {
      if (cleanup) cleanup()
    })
  }
})
