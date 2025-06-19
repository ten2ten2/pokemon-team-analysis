import { Dex as SimDex } from '@pkmn/sim';
import { Formats } from './customFormats';

// 使用全局符号作为唯一标识符，避免重复初始化
const FORMATS_INITIALIZED_SYMBOL = Symbol.for('pokemon-team-analysis:formats-initialized');

/**
 * 检查格式是否已经初始化
 */
function isFormatsInitialized(): boolean {
  return (globalThis as any)[FORMATS_INITIALIZED_SYMBOL] === true;
}

/**
 * 标记格式已初始化
 */
function markFormatsInitialized(): void {
  (globalThis as any)[FORMATS_INITIALIZED_SYMBOL] = true;
}

/**
 * 初始化自定义格式（幂等操作）
 */
export function initializeFormats(): void {
  // 如果已经初始化过，直接返回
  if (isFormatsInitialized()) {
    return;
  }

  try {
    // 验证 Formats 数据
    if (!Formats || !Array.isArray(Formats)) {
      throw new Error('Invalid Formats data');
    }

    // 检查是否有格式已经存在（防止重复添加）
    // 注意：格式ID现在是从name自动生成的（转为小写）
    const customFormatNames = ['doublesregg', 'doublesregh', 'doublesregi', 'singlesregg', 'singlesregh', 'singlesregi'];
    const existingFormats = customFormatNames.filter(name => {
      try {
        const format = SimDex.formats.get(name);
        // 强制触发格式对象的完全初始化
        const formatExists = format?.exists;
        return format && formatExists;
      } catch {
        return false;
      }
    });

    if (existingFormats.length > 0) {
      markFormatsInitialized();
      return;
    }

    SimDex.formats.extend(Formats);
    markFormatsInitialized();

  } catch (error) {
    console.error('❌ Failed to initialize custom formats:', error);

    // 如果是重复 ID 错误，仍然标记为已初始化
    if (error instanceof Error && error.message.includes('duplicate ID')) {
      markFormatsInitialized();
      return;
    }

    throw error;
  }
}

/**
 * 验证格式是否已正确加载
 */
export function verifyFormatsLoaded(): boolean {
  if (!isFormatsInitialized()) {
    return false;
  }

  // 注意：格式ID现在是从name自动生成的（转为小写）
  const customFormatNames = ['doublesregg', 'doublesregh', 'doublesregi', 'singlesregg', 'singlesregh', 'singlesregi'];

  for (const formatName of customFormatNames) {
    try {
      const format = SimDex.formats.get(formatName);

      // 强制触发格式对象的完全初始化，解决惰性加载问题
      // 这等价于 console.log(format) 的效果，但更明确
      const formatExists = format?.exists;

      if (!format || !formatExists) {
        console.warn(`Format ${formatName} not found or doesn't exist in SimDex`);
        return false;
      }
    } catch (error) {
      console.warn(`Error checking format ${formatName}:`, error);
      return false;
    }
  }

  return true;
}

// 模块加载时自动初始化
initializeFormats();

// 延迟验证以确保格式完全加载（解决惰性加载时序问题）
setTimeout(() => {
  if (!verifyFormatsLoaded()) {
    console.error('⚠️ Format initialization verification failed');
  }
}, 100); // 使用稍长的延迟确保初始化完成
