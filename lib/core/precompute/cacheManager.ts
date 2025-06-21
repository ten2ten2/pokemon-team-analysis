import { CACHE_MANAGER_CONFIG, CACHE_HEALTH_THRESHOLDS } from '~/lib/core/constants'

// ==================== Enhanced Cache Manager ====================

interface CacheEntry<T> {
  data: T
  timestamp: Date
  version: string
  ttl?: number
  accessCount: number
  lastAccessed: Date
  compressed?: boolean
}

interface CacheOptions {
  ttl?: number
  compress?: boolean
  priority?: 'low' | 'normal' | 'high'
}

interface CacheStats {
  totalEntries: number
  memoryUsage: string
  hitRate: number
  missRate: number
  totalHits: number
  totalMisses: number
  compressionRatio: number
  evictionCount: number
}

class EnhancedCacheManager {
  private static instance: EnhancedCacheManager
  private cache = new Map<string, CacheEntry<any>>()

  // 统计信息
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    compressions: 0
  }

  private cleanupTimer?: NodeJS.Timeout

  private constructor() {
    this.startPeriodicCleanup()
  }

  static getInstance(): EnhancedCacheManager {
    if (!EnhancedCacheManager.instance) {
      EnhancedCacheManager.instance = new EnhancedCacheManager()
    }
    return EnhancedCacheManager.instance
  }

  // ==================== Enhanced Cache Operations ====================

  set<T>(key: string, data: T, options?: CacheOptions): void {
    const { ttl, compress = false } = options || {}

    // 检查缓存大小限制
    if (this.cache.size >= CACHE_MANAGER_CONFIG.MAX_CACHE_SIZE) {
      this.evictLRU()
    }

    let processedData = data
    let isCompressed = false

    // 数据压缩（针对大对象）
    if (compress && this.shouldCompress(data)) {
      processedData = this.compressData(data)
      isCompressed = true
      this.stats.compressions++
    }

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: new Date(),
      version: CACHE_MANAGER_CONFIG.CURRENT_VERSION,
      ttl,
      accessCount: 0,
      lastAccessed: new Date(),
      compressed: isCompressed
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // 检查版本兼容性
    if (entry.version !== CACHE_MANAGER_CONFIG.CURRENT_VERSION) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // 检查TTL
    if (entry.ttl) {
      const now = new Date().getTime()
      const entryTime = entry.timestamp.getTime()
      if (now - entryTime > entry.ttl) {
        this.cache.delete(key)
        this.stats.misses++
        return null
      }
    }

    // 更新访问信息
    entry.accessCount++
    entry.lastAccessed = new Date()
    this.stats.hits++

    // 解压缩数据
    let result = entry.data
    if (entry.compressed) {
      result = this.decompressData(entry.data)
    }

    return result as T
  }

  // ==================== Batch Operations ====================

  setBatch<T>(entries: Array<{ key: string; data: T; options?: CacheOptions }>): void {
    entries.forEach(({ key, data, options }) => {
      this.set(key, data, options)
    })
  }

  getBatch<T>(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>()
    keys.forEach(key => {
      results.set(key, this.get<T>(key))
    })
    return results
  }

  deleteBatch(keys: string[]): number {
    let deletedCount = 0
    keys.forEach(key => {
      if (this.cache.delete(key)) {
        deletedCount++
      }
    })
    return deletedCount
  }

  // ==================== Advanced Operations ====================

  /**
   * 获取匹配模式的所有键
   */
  getKeysByPattern(pattern: RegExp): string[] {
    return Array.from(this.cache.keys()).filter(key => pattern.test(key))
  }

  /**
   * 清理匹配模式的缓存
   */
  clearByPattern(pattern: RegExp): number {
    const matchingKeys = this.getKeysByPattern(pattern)
    return this.deleteBatch(matchingKeys)
  }

  /**
   * 获取最热门的缓存项
   */
  getHotKeys(limit: number = 10): Array<{ key: string; accessCount: number }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
  }

  /**
   * 预热缓存
   */
  async warmup<T>(warmupData: Array<{ key: string; dataProvider: () => Promise<T> }>): Promise<void> {
    const promises = warmupData.map(async ({ key, dataProvider }) => {
      try {
        const data = await dataProvider()
        this.set(key, data, { priority: 'high' })
      } catch (error) {
        console.warn(`Failed to warmup cache for key ${key}:`, error)
      }
    })

    await Promise.all(promises)
    console.log(`Cache warmed up with ${warmupData.length} entries`)
  }

  // ==================== Memory Management ====================

  /**
   * LRU 驱逐策略
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed.getTime() < oldestTime) {
        oldestTime = entry.lastAccessed.getTime()
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  /**
   * 定期清理过期缓存
   */
  private startPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, CACHE_MANAGER_CONFIG.CLEANUP_INTERVAL)
  }

  private cleanupExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl && now - entry.timestamp.getTime() > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    if (keysToDelete.length > 0) {
      const deletedCount = this.deleteBatch(keysToDelete)
      console.log(`Cleanup completed: ${deletedCount}/${keysToDelete.length} expired cache entries removed`)

      // 如果删除数量不匹配，记录警告
      if (deletedCount !== keysToDelete.length) {
        console.warn(`Cleanup warning: Expected to delete ${keysToDelete.length} entries, actually deleted ${deletedCount}`)
      }
    }
  }

  // ==================== Compression ====================

  private shouldCompress(data: any): boolean {
    // 判断是否需要压缩（基于数据大小）
    const dataSize = JSON.stringify(data).length
    return dataSize > CACHE_MANAGER_CONFIG.COMPRESSION_THRESHOLD // 大于 threshold 的数据进行压缩
  }

  private compressData<T>(data: T): T {
    // 简单的JSON压缩（实际应用中可以使用更高效的压缩算法）
    return JSON.parse(JSON.stringify(data)) as T
  }

  private decompressData<T>(compressedData: T): T {
    return compressedData
  }

  // ==================== Statistics and Monitoring ====================

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
    const missRate = totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0

    // 计算内存使用
    const memoryUsage = this.calculateMemoryUsage()

    // 计算压缩比
    const compressionRatio = this.calculateCompressionRatio()

    return {
      totalEntries: this.cache.size,
      memoryUsage: `${Math.round(memoryUsage / 1024)}KB`,
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      evictionCount: this.stats.evictions
    }
  }

  private calculateMemoryUsage(): number {
    // 估算内存使用量
    let totalSize = 0
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2 // 字符串大小估算
      totalSize += JSON.stringify(entry).length * 2
    }
    return totalSize
  }

  private calculateCompressionRatio(): number {
    let compressedCount = 0
    for (const entry of this.cache.values()) {
      if (entry.compressed) {
        compressedCount++
      }
    }
    return this.cache.size > 0 ? (compressedCount / this.cache.size) * 100 : 0
  }

  // ==================== Utility Methods ====================

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0, compressions: 0 }
  }

  /**
   * 获取缓存健康报告
   */
  getHealthReport(): {
    status: 'healthy' | 'warning' | 'critical'
    metrics: CacheStats
    recommendations: string[]
  } {
    const stats = this.getStats()
    const recommendations: string[] = []

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    // 检查命中率
    if (stats.hitRate < CACHE_HEALTH_THRESHOLDS.HIT_RATE_WARNING) {
      status = 'warning'
      recommendations.push('Low hit rate - consider adjusting cache strategy')
    }

    // 检查内存使用
    const memoryKB = parseInt(stats.memoryUsage.replace('KB', ''))
    if (memoryKB > CACHE_HEALTH_THRESHOLDS.MEMORY_CRITICAL) { // 50MB
      status = 'critical'
      recommendations.push('High memory usage - consider increasing eviction frequency')
    }

    // 检查驱逐频率
    if (stats.evictionCount > stats.totalEntries * 0.1) {
      status = 'warning'
      recommendations.push('High eviction rate - consider increasing cache size')
    }

    return { status, metrics: stats, recommendations }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
  }
}

// ==================== Export ====================

export const cacheManager = EnhancedCacheManager.getInstance()
export default cacheManager
