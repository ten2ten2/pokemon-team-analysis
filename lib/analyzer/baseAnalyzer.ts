import type { Pokemon } from '~/lib/core/types'
import { dataService } from '~/lib/core/dataService'
import { cacheManager } from '~/lib/core/cacheManager'

// ==================== Base Analyzer ====================

export abstract class BaseAnalyzer<TResult, TOptions = {}> {
  protected dataService = dataService
  protected cacheManager = cacheManager

  // ==================== Abstract Methods ====================

  // 获取分析类型名称
  abstract getAnalysisType(): string

  // 执行分析的核心方法
  abstract analyze(team: Pokemon[], options?: TOptions): TResult

  // ==================== Common Methods ====================

  // 带缓存的分析方法
  public analyzeWithCache(
    team: Pokemon[],
    teamId: string,
    options?: TOptions,
    ttl?: number
  ): TResult {
    // 生成缓存键
    const optionsHash = options ? JSON.stringify(options) : ''
    const cacheKey = `${this.getAnalysisType()}:${teamId}:${optionsHash}`

    // 尝试从缓存获取
    const cachedResult = this.cacheManager.get<TResult>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    // 执行分析
    const result = this.analyze(team, options)

    // 缓存结果
    this.cacheManager.set(cacheKey, result, { ttl })

    return result
  }

  // 获取所有属性类型（不包括太晶属性）
  public getAllTypesExceptStellar(): string[] {
    const allTypes = Array.from(this.dataService.getGeneration().types, (t: any) => t.name);
    return allTypes.filter(type => type !== 'Stellar')
  }
}
