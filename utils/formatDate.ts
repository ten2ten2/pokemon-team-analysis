/**
 * Format date string according to locale
 * @param dateString - Date string to format (ISO string, timestamp, or parseable date string)
 * @param locale - Locale string (e.g., 'en', 'zh-hans', 'ja', 'ko', 'zh-hant')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string): string {
  // Map our locale codes to standard locale identifiers
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW',
    'ja': 'ja-JP',
    'ko': 'ko-KR'
  }

  const standardLocale = localeMap[locale] || locale

  try {
    // Parse the date string
    let date: Date

    // Handle different date string formats
    if (dateString.includes('T') || dateString.includes('Z')) {
      // ISO date string
      date = new Date(dateString)
    } else if (/^\d+$/.test(dateString)) {
      // Unix timestamp (string of numbers)
      date = new Date(parseInt(dateString, 10))
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // YYYY-MM-DD format
      date = new Date(dateString + 'T00:00:00')
    } else {
      // Try to parse as general date string
      date = new Date(dateString)
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }

    // Format based on locale with appropriate options
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }

    // Adjust format options for specific locales if needed
    if (locale.startsWith('zh')) {
      // Chinese locales might prefer different formatting
      formatOptions.month = 'long'
    }

    return new Intl.DateTimeFormat(standardLocale, formatOptions).format(date)
  } catch (error) {
    console.warn(`Failed to format date "${dateString}" with locale "${locale}":`, error)

    // Fallback: try with current date and English locale
    try {
      const fallbackDate = new Date()
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(fallbackDate)
    } catch (fallbackError) {
      // Ultimate fallback
      return new Date().toLocaleDateString()
    }
  }
}

/**
 * Get current date formatted according to locale
 * @param locale - Locale string
 * @returns Current date formatted as string
 */
export function getCurrentFormattedDate(locale: string): string {
  return formatDate(new Date().toISOString(), locale)
}

/**
 * Format date with custom options
 * @param dateString - Date string to format
 * @param locale - Locale string
 * @param options - Custom Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateWithOptions(
  dateString: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW',
    'ja': 'ja-JP',
    'ko': 'ko-KR'
  }

  const standardLocale = localeMap[locale] || locale

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }

    return new Intl.DateTimeFormat(standardLocale, options).format(date)
  } catch (error) {
    console.warn(`Failed to format date with custom options:`, error)
    return formatDate(dateString, locale)
  }
}
