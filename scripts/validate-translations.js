import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const directory = join(import.meta.dirname, '../i18n/locales')
const translations = Object.fromEntries(readdirSync(directory).filter(file => file.endsWith('.json'))
  .map(file => [file.slice(0, -5), JSON.parse(readFileSync(join(directory, file), 'utf8'))]))

function keys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return child !== null && typeof child === 'object' ? keys(child, path) : [path]
  })
}

const reference = new Set(keys(translations.en))
let failed = false
for (const [locale, messages] of Object.entries(translations)) {
  const actual = new Set(keys(messages))
  const missing = [...reference].filter(key => !actual.has(key))
  const extra = [...actual].filter(key => !reference.has(key))
  if (missing.length || extra.length) {
    failed = true
    console.error(`${locale}: missing [${missing.join(', ')}], extra [${extra.join(', ')}]`)
  }
}
if (failed) process.exitCode = 1
else console.log(`Validated ${Object.keys(translations).length} locales (${reference.size} keys each).`)
