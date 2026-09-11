export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.replace(/\/+$/, '') || '/'
  const localePath = useLocalePath()
  const destination = /^\/(?:ja\/|ko\/|zh-hans\/|zh-hant\/)?teams$/.test(path)
    ? localePath('/') : path
  if (destination !== to.path) {
    return navigateTo({ path: destination, query: to.query, hash: to.hash }, { redirectCode: 301 })
  }
})
