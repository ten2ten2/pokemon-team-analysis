import { Dex } from '@pkmn/sim'
import { Formats } from './customFormats'

export function initializeFormats(): void {
  const missing = Formats.filter(format => !Dex.formats.get(format.name).exists)
  if (missing.length) Dex.formats.extend(missing)
}
