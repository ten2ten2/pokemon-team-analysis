import type { Pokemon } from '~/lib/core/types'
import { dataService } from '~/lib/core/dataService'

export abstract class BaseAnalyzer<TResult, TOptions> {
  protected dataService = dataService
  abstract analyze(team: Pokemon[], options?: TOptions): TResult

  getAllTypesExceptStellar(): string[] {
    return Array.from(this.dataService.getGeneration().types, type => type.name)
      .filter(type => type !== 'Stellar')
  }
}
