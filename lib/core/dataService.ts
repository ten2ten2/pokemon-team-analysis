// 外部依赖
import { Dex } from '@pkmn/dex'
import { Generations, type Generation } from '@pkmn/data'

// 项目常量和服务
import { CACHE_KEYS, CACHE_TTL, DEFAULT_GENERATION } from './constants'
import { cacheManager } from '~/lib/core/cacheManager'

// ==================== Data Service ====================

class DataService {
  private static instance: DataService
  private currentGeneration: number = DEFAULT_GENERATION

  private constructor() { }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  // ==================== Generation Management ====================

  /**
   * 获取缓存的世代数据
   */
  private getCachedGeneration(genNum: number): Generation {
    const cacheKey = CACHE_KEYS.GENERATION(genNum)

    let generation = cacheManager.get<Generation>(cacheKey)
    if (!generation) {
      generation = new Generations(Dex).get(genNum)
      // 长期缓存世代数据
      cacheManager.set(cacheKey, generation, { ttl: CACHE_TTL.LONG })
    }

    return generation
  }

  /**
   * 设置当前使用的世代
   */
  setGeneration(gen: number): void {
    this.currentGeneration = gen
  }

  /**
   * 获取当前世代对象
   */
  getGeneration(gen?: number): Generation {
    const genToUse = gen ?? this.currentGeneration
    return this.getCachedGeneration(genToUse)
  }
}

// ==================== Export ====================

export const dataService = DataService.getInstance()
export default dataService
