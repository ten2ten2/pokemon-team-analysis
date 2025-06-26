import { readFile } from 'fs/promises'
import { join, resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // 使用更安全的路径解析方式，确保在 Vercel 生产环境中正常工作
    // 优先使用 server/assets，如果不存在则回退到 data 目录
    const serverAssetsDir = resolve(process.cwd(), 'server/assets')
    const dataDir = resolve(process.cwd(), 'data')

    // 尝试从 server/assets 读取，如果失败则从 data 目录读取
    const tryReadFile = async (filename: string) => {
      try {
        return await readFile(join(serverAssetsDir, filename), 'utf-8')
      } catch {
        return await readFile(join(dataDir, filename), 'utf-8')
      }
    }

    // 并行读取所有翻译文件
    const [speciesData, abilitiesData, movesData, itemsData, typesData] = await Promise.all([
      tryReadFile('species_i18n.json').then(JSON.parse),
      tryReadFile('ability_i18n.json').then(JSON.parse),
      tryReadFile('move_i18n.json').then(JSON.parse),
      tryReadFile('item_i18n.json').then(JSON.parse),
      tryReadFile('type_i18n.json').then(JSON.parse)
    ])

    // 合并所有翻译数据
    const translationData = {
      species: speciesData,
      abilities: abilitiesData,
      moves: movesData,
      items: itemsData,
      types: typesData
    }

    // 设置缓存头以提高性能
    setHeader(event, 'Cache-Control', 'public, max-age=3600, must-revalidate') // 缓存1小时，但允许重新验证
    setHeader(event, 'ETag', `"pokemon-translations-${Date.now()}"`) // 添加ETag用于缓存验证

    return translationData
  } catch (error) {
    console.error('Error loading translation data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load translation data'
    })
  }
})
