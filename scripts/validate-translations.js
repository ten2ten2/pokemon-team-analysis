import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all locale files
const localesDir = path.join(__dirname, '../i18n/locales');
const localeFiles = fs.readdirSync(localesDir).filter(file => file.endsWith('.json'));

console.log('🔍 Validating translation files...\n');

// Function to get all keys from an object recursively
function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

// Load all translation files
const translations = {};
const allKeys = {};

for (const file of localeFiles) {
  const locale = path.basename(file, '.json');
  const filePath = path.join(localesDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  translations[locale] = content;
  allKeys[locale] = getKeys(content);
}

// Get reference keys (from English)
const referenceLocale = 'en';
const referenceKeys = allKeys[referenceLocale];

if (!referenceKeys) {
  console.error('❌ Reference locale (en) not found!');
  process.exit(1);
}

console.log(`📋 Reference locale: ${referenceLocale}`);
console.log(`🔑 Total keys: ${referenceKeys.length}\n`);

// Check each locale against reference
let hasErrors = false;

for (const locale of Object.keys(allKeys)) {
  if (locale === referenceLocale) continue;

  const localeKeys = allKeys[locale];
  const missingKeys = referenceKeys.filter(key => !localeKeys.includes(key));
  const extraKeys = localeKeys.filter(key => !referenceKeys.includes(key));

  console.log(`🌐 Checking ${locale}:`);

  if (missingKeys.length === 0 && extraKeys.length === 0) {
    console.log('  ✅ All keys match!');
  } else {
    hasErrors = true;

    if (missingKeys.length > 0) {
      console.log(`  ❌ Missing keys (${missingKeys.length}):`);
      missingKeys.forEach(key => console.log(`    - ${key}`));
    }

    if (extraKeys.length > 0) {
      console.log(`  ⚠️  Extra keys (${extraKeys.length}):`);
      extraKeys.forEach(key => console.log(`    + ${key}`));
    }
  }
  console.log('');
}

if (hasErrors) {
  console.log('❌ Validation failed! Please fix the missing or extra keys.');
  process.exit(1);
} else {
  console.log('🎉 All translation files are consistent!');
}
