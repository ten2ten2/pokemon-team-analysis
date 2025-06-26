import speciesData from '~/server/assets/data/species_i18n.json'
import abilitiesData from '~/server/assets/data/ability_i18n.json'
import movesData from '~/server/assets/data/move_i18n.json'
import itemsData from '~/server/assets/data/item_i18n.json'
import typesData from '~/server/assets/data/type_i18n.json'

export default defineEventHandler(async (event) => {
  try {
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
