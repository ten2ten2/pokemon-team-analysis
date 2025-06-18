import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dataDir = join(process.cwd(), 'data')

    // 并行读取所有翻译文件
    const [speciesData, abilitiesData, movesData, itemsData, typesData] = await Promise.all([
      readFile(join(dataDir, 'species_i18n.json'), 'utf-8').then(JSON.parse),
      readFile(join(dataDir, 'ability_i18n.json'), 'utf-8').then(JSON.parse),
      readFile(join(dataDir, 'move_i18n.json'), 'utf-8').then(JSON.parse),
      readFile(join(dataDir, 'item_i18n.json'), 'utf-8').then(JSON.parse),
      readFile(join(dataDir, 'type_i18n.json'), 'utf-8').then(JSON.parse)
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
