import idMapping from './pokemon-id-mapping.json'
import { normalizeName } from '../core/utils'

export function getPokeApiNum(name: string, nationalId = 0): number {
  return (idMapping as Record<string, number>)[normalizeName(name)] ?? nationalId
}
