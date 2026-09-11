import speciesData from '../assets/data/species_i18n.json'
import abilitiesData from '../assets/data/ability_i18n.json'
import movesData from '../assets/data/move_i18n.json'
import itemsData from '../assets/data/item_i18n.json'
import typesData from '../assets/data/type_i18n.json'

export default defineCachedEventHandler(() => ({
  species: speciesData,
  abilities: abilitiesData,
  moves: movesData,
  items: itemsData,
  types: typesData,
}), { maxAge: 3600 })
