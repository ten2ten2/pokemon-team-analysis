/**
 * 安全的客户端状态管理 composable
 * 避免 hydration mismatch 问题
 */
export const useClientState = <T>(initialValue: T) => {
  const state = ref<T>(initialValue)
  const isHydrated = ref(false)

  // 只在客户端设置为已水合
  onMounted(() => {
    if (import.meta.client) {
      isHydrated.value = true
    }
  })

  // 安全的状态更新函数
  const setState = (newValue: T) => {
    if (import.meta.client) {
      state.value = newValue
    }
  }

  // 安全的状态获取函数
  const getState = (): T => {
    return isHydrated.value ? state.value : initialValue
  }

  return {
    state: readonly(state),
    isHydrated: readonly(isHydrated),
    setState,
    getState
  }
}

/**
 * 专门用于处理需要客户端初始化的异步状态
 */
export const useAsyncClientState = <T>(
  initialValue: T,
  asyncLoader: () => Promise<T>
) => {
  const { state, isHydrated, setState } = useClientState(initialValue)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // 在客户端加载数据
  const loadData = async () => {
    if (!import.meta.client || isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const data = await asyncLoader()
      setState(data)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      console.error('Error loading async client state:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 在组件挂载后自动加载数据
  onMounted(() => {
    if (import.meta.client) {
      nextTick(() => {
        loadData()
      })
    }
  })

  return {
    state: readonly(state),
    isHydrated: readonly(isHydrated),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadData,
    setState
  }
}
