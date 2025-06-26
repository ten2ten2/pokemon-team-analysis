export default defineNuxtRouteMiddleware((to) => {
  // 跳过根路径和API路径
  if (to.path === '/' || to.path.startsWith('/api/')) {
    return
  }

  // 1. 处理 teams 路径重定向到首页
  const teamsRedirectRules: Record<string, string> = {
    '/teams': '/',
    '/teams/': '/',
    '/ja/teams': '/ja',
    '/ja/teams/': '/ja',
    '/ko/teams': '/ko',
    '/ko/teams/': '/ko',
    '/zh-hans/teams': '/zh-hans',
    '/zh-hans/teams/': '/zh-hans',
    '/zh-hant/teams': '/zh-hant',
    '/zh-hant/teams/': '/zh-hant'
  }

  if (teamsRedirectRules[to.path]) {
    return navigateTo(teamsRedirectRules[to.path], {
      redirectCode: 301
    })
  }

  // 2. 处理尾斜杠重定向
  if (to.path.endsWith('/')) {
    const pathWithoutSlash = to.path.slice(0, -1)

    // 保持查询参数和哈希
    const query = to.query
    const hash = to.hash

    return navigateTo({
      path: pathWithoutSlash,
      query,
      hash
    }, {
      redirectCode: 301
    })
  }
})
