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

  // Initialize on app mounted
  let cleanup: (() => void) | null = null

  onMounted(() => {
    cleanup = initSmoothScroll()
  })

  // Also reinitialize when navigating to new pages
  const router = useRouter()
  router.afterEach(() => {
    nextTick(() => {
      if (cleanup) cleanup()
      cleanup = initSmoothScroll()
    })
  })

  // Cleanup on app unmount
  onBeforeUnmount(() => {
    if (cleanup) cleanup()
  })
})
