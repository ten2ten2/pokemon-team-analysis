/**
 * 核心工具函数
 * 为了保持 lib 目录的独立性，这里包含所有 lib 内部需要的工具函数
 */

/**
 * 将名称转换为小写，并去除非字母数字和空格
 * 主要用于标准化 Pokemon 名称以匹配 ID 映射表
 * @param name - 原始名称
 * @returns 标准化后的名称
 */
export function normalizeName(name: string): string {
  return name.toLowerCase()       // 转换为小写
    .replace(/\s*-\s*/g, '-')     // 把「多个空格 + 连字符 + 多个空格」都统一替换成单个连字符
    .replace(/[^a-z0-9 \-]/g, '') // 移除所有非字母、数字、空格和连字符的字符
    .replace(/ +/g, '-')          // 将所有空格替换为连字符
}
