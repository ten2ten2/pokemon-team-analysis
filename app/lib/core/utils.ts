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

/**
 * 判断宝可梦是否是地面上的宝可梦
 *
 * @param types - 宝可梦的属性
 * @param ability - 宝可梦的特性
 * @param item - 宝可梦的道具
 * @returns 是否是地面上的宝可梦
 */
export function isOnTerrain(types: string[], ability: string, item: string): boolean {
  const isFlying = types.includes('Flying');
  const hasLevitate = ability === 'Levitate';
  const hasAirBalloon = item === 'Air Balloon';
  const hasIronBall = item === 'Iron Ball';

  return (!isFlying && !hasLevitate && !hasAirBalloon) || hasIronBall;
}
