import { Dex } from '@pkmn/dex'
import { Generations } from '@pkmn/data'
import type { GenerationNum } from '@pkmn/types'
import { DEFAULT_GENERATION } from './constants'

const generations = new Generations(Dex)

export const dataService = {
  getGeneration(gen: GenerationNum = DEFAULT_GENERATION) {
    return generations.get(gen)
  },
}
