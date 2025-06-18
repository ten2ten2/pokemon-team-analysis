/**
 * URL 友好的 ID 生成工具
 */

/**
 * 生成短的随机字符串 ID（推荐用于 URL）
 * 默认长度 8，包含字母和数字，URL 安全
 *
 * @param length ID 长度，默认 8
 * @returns 短随机 ID，如 "a3k9m2x7"
 */
export function generateShortId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成 Base36 编码的时间戳 ID
 * 基于时间戳但更短，仍保持时序性
 *
 * @returns Base36 时间戳 ID，如 "l8x9k2m"
 */
export function generateTimestampId(): string {
  return Date.now().toString(36)
}

/**
 * 生成混合 ID：时间戳 + 随机后缀
 * 保持时序性的同时增加随机性
 *
 * @param randomLength 随机后缀长度，默认 4
 * @returns 混合 ID，如 "l8x9k2m-a3k9"
 */
export function generateHybridId(randomLength: number = 4): string {
  const timestamp = Date.now().toString(36)
  const random = generateShortId(randomLength)
  return `${timestamp}-${random}`
}

/**
 * 生成 UUID v4（标准 UUID）
 * 最安全但较长，适合需要全局唯一性的场景
 *
 * @returns UUID，如 "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 生成短 UUID（去掉连字符的短版本）
 * 比完整 UUID 短但仍然很安全
 *
 * @returns 短 UUID，如 "f47ac10b58cc4372a5670e02b2c3d479"
 */
export function generateShortUUID(): string {
  return generateUUID().replace(/-/g, '')
}

/**
 * 生成可读的 ID（基于词汇）
 * 更容易记忆和分享，适合用户友好的场景
 *
 * @returns 可读 ID，如 "happy-cat-123"
 */
export function generateReadableId(): string {
  const adjectives = [
    'happy', 'brave', 'clever', 'gentle', 'bright', 'swift', 'calm', 'bold',
    'wise', 'kind', 'quick', 'strong', 'cool', 'warm', 'fresh', 'clear'
  ]

  const nouns = [
    'cat', 'dog', 'bird', 'fish', 'lion', 'bear', 'wolf', 'fox',
    'star', 'moon', 'sun', 'tree', 'rock', 'wave', 'fire', 'wind'
  ]

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 1000)

  return `${adjective}-${noun}-${number}`
}

/**
 * ID 生成器配置选项
 */
export interface IdGeneratorOptions {
  type: 'short' | 'timestamp' | 'hybrid' | 'uuid' | 'short-uuid' | 'readable'
  length?: number // 仅适用于 'short' 和 'hybrid' 类型
}

/**
 * 统一的 ID 生成函数
 *
 * @param options ID 生成选项
 * @returns 生成的 ID
 */
export function generateId(options: IdGeneratorOptions = { type: 'short' }): string {
  switch (options.type) {
    case 'short':
      return generateShortId(options.length)
    case 'timestamp':
      return generateTimestampId()
    case 'hybrid':
      return generateHybridId(options.length)
    case 'uuid':
      return generateUUID()
    case 'short-uuid':
      return generateShortUUID()
    case 'readable':
      return generateReadableId()
    default:
      return generateShortId()
  }
}

/**
 * 推荐的 ID 配置方案
 *
 * 根据不同使用场景选择合适的 ID 类型：
 *
 * 1. URL 分享 (推荐): hybrid
 *    - 示例: "mc19vtgd-h9br"
 *    - 优点: 短小、时序性、不易冲突
 *    - 配置: { type: 'hybrid', length: 4 }
 *
 * 2. 用户友好: readable
 *    - 示例: "happy-cat-123"
 *    - 优点: 易记忆、易分享
 *    - 配置: { type: 'readable' }
 *
 * 3. 高安全性: short-uuid
 *    - 示例: "f47ac10b58cc4372a5670e02b2c3d479"
 *    - 优点: 全局唯一、不可预测
 *    - 配置: { type: 'short-uuid' }
 *
 * 4. 最简短: short
 *    - 示例: "a3k9m2x7"
 *    - 优点: 最短、简洁
 *    - 配置: { type: 'short', length: 8 }
 */
