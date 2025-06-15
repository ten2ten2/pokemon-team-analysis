import { Team, type PokemonSet } from '@pkmn/sets';
import { Generations } from '@pkmn/data';
import { Dex } from '@pkmn/dex';
import {
  getAbilityMultiplier,
  getItemMultiplier,
  RING_TARGET_EFFECTS,
  filterTypes,
  getPokemonDisplayName,
  hasType,
  getWeatherMultiplier,
} from './resistanceUtils';

// ==================== 类型定义 ====================

export interface ResistanceItem {
  name: string;
  ability?: string;
  item?: string;
}

export interface ResistanceReport {
  [type: string]: { [multiplier: number]: Array<ResistanceItem> };
}

// ==================== 辅助函数 ====================

/**
 * 将抗性报告转换为数组
 * @param report 抗性报告
 * @returns 数组
 */
export function normalizeReport(report: ResistanceReport): { type: string; multiplier: { [multiplier: number]: ResistanceItem[]; }; }[] {
  return Object.entries(report).map(([type, multiplier]) => ({ type, multiplier }));
}

/**
 * 处理黑色铁球的特殊效果
 */
function handleIronBallEffect(
  pokemon: PokemonSet | Partial<PokemonSet>,
  attackType: string,
  pokemonTypes: string[],
  baseMult: number,
  abilityMult: number
): { baseMult: number; abilityMult: number } {
  if (pokemon.item !== 'Iron Ball' || attackType !== 'Ground') {
    return { baseMult, abilityMult };
  }

  let newBaseMult = baseMult;
  let newAbilityMult = abilityMult;

  // 地面属性招式对飞行属性宝可梦伤害固定 x1
  if (hasType(pokemonTypes, 'Flying')) {
    newBaseMult = 1;
  }
  // 地面属性招式对漂浮特性宝可梦，漂浮特性失去效果
  else if (pokemon.ability === 'Levitate') {
    newAbilityMult = 1;
  }

  return { baseMult: newBaseMult, abilityMult: newAbilityMult };
}

/**
 * 处理标靶道具的特殊效果
 */
function handleRingTargetEffect(
  pokemon: PokemonSet | Partial<PokemonSet>,
  attackType: string,
  pokemonTypes: string[],
  types: any
): number {
  if (pokemon.item !== 'Ring Target') {
    return types.totalEffectiveness(attackType, pokemonTypes);
  }

  const targetType = RING_TARGET_EFFECTS[attackType];
  if (targetType && hasType(pokemonTypes, targetType)) {
    const filteredTypes = filterTypes(pokemonTypes, targetType);
    return types.totalEffectiveness(attackType, filteredTypes);
  }

  return types.totalEffectiveness(attackType, pokemonTypes);
}

/**
 * 计算单个宝可梦对特定属性攻击的抗性倍率
 */
function calculatePokemonResistance(
  pokemon: PokemonSet | Partial<PokemonSet>,
  attackType: string,
  types: any,
  species: any
): number {
  const pokemonSpecies = species.get(pokemon.species as string);
  const pokemonTypes = pokemonSpecies?.types ?? [];

  // 1. 计算基础属性抗性
  let baseMult = types.totalEffectiveness(attackType, pokemonTypes);

  // 2. 处理标靶道具的特殊效果（需要在基础计算后处理）
  baseMult = handleRingTargetEffect(pokemon, attackType, pokemonTypes, types);

  // 3. 计算特性影响
  let abilityMult = getAbilityMultiplier(pokemon.ability, attackType);

  // 4. 处理黑色铁球的特殊效果
  const ironBallResult = handleIronBallEffect(
    pokemon,
    attackType,
    pokemonTypes,
    baseMult,
    abilityMult
  );
  baseMult = ironBallResult.baseMult;
  abilityMult = ironBallResult.abilityMult;

  // 5. 计算道具影响
  const itemMult = getItemMultiplier(pokemon.item, attackType);

  return baseMult * abilityMult * itemMult;
}

/**
 * 创建抗性项目对象
 */
function createResistanceItem(pokemon: PokemonSet | Partial<PokemonSet>): ResistanceItem {
  return {
    name: getPokemonDisplayName(pokemon),
    ability: pokemon.ability,
    item: pokemon.item,
  };
}

// ==================== 主要函数 ====================

/**
 * 分析队伍对各属性攻击的抗性
 * @param team 宝可梦队伍
 * @param genNum 世代编号
 * @returns 抗性分析报告
 */
export function resistanceAnalysis(team: Team, genNum: number): ResistanceReport {
  const result: ResistanceReport = {};
  const gen = new Generations(Dex).get(genNum);
  const types = gen.types;
  const species = gen.species;

  // 获取所有属性类型 (排除星晶属性)
  const typeList = Array.from(gen.types, (t) => t.name).filter(
    type => type !== 'Stellar'
  );

  const pokemonList = Array.from(team.team);

  // 遍历每个攻击属性
  for (const attackType of typeList) {
    result[attackType] = {};

    // 遍历队伍中的每个宝可梦
    for (const pokemon of pokemonList) {
      const finalMultiplier = calculatePokemonResistance(
        pokemon,
        attackType,
        types,
        species
      );

      // 将结果添加到报告中
      if (!result[attackType][finalMultiplier]) {
        result[attackType][finalMultiplier] = [];
      }
      result[attackType][finalMultiplier].push(createResistanceItem(pokemon));
    }
  }

  return result;
}

/**
 * 根据天气和场地状态，返回修正后的抗性报告
 * @param report 抗性报告
 * @param weather 天气
 * @param terrain 场地
 * @returns 抗性报告
 */
export function resistanceUnderStatus(report: { type: string; multiplier: { [multiplier: number]: ResistanceItem[]; }; }[], weather?: string, terrain?: string): { type: string; multiplier: { [multiplier: number]: ResistanceItem[]; }; }[] {
  // 如果没有天气+没有场地，直接返回原报告
  if (!weather && !terrain) {
    return report;
  }

  // 如果天气存在，则根据天气修正抗性报告
  if (weather) {
    report = report.map(item => {
      const weatherMultiplier = getWeatherMultiplier(weather, item.type);
      return {
        ...item,
        multiplier: Object.entries(item.multiplier).reduce((acc, [mult, pokemons]) => {
          // 分离有万能伞和没有万能伞的宝可梦
          const umbrellaPokemons = pokemons.filter(p => p.item === 'Utility Umbrella');
          const normalPokemons = pokemons.filter(p => p.item !== 'Utility Umbrella');

          // 有万能伞的宝可梦不受晴天和雨天影响
          if (umbrellaPokemons.length > 0) {
            // 只有在晴天或雨天时万能伞才生效
            if (weather === 'Rain' || weather === 'Harsh Sunlight') {
              acc[Number(mult)] = umbrellaPokemons;
            } else {
              // 其他天气下万能伞无效，仍然受天气影响
              const newMult = Number(mult) * weatherMultiplier;
              if (!acc[newMult]) {
                acc[newMult] = [];
              }
              acc[newMult] = [...acc[newMult], ...umbrellaPokemons];
            }
          }

          // 没有万能伞的宝可梦受天气影响
          if (normalPokemons.length > 0) {
            const newMult = Number(mult) * weatherMultiplier;
            if (!acc[newMult]) {
              acc[newMult] = [];
            }
            acc[newMult] = [...acc[newMult], ...normalPokemons];
          }
          return acc;
        }, {} as { [multiplier: number]: ResistanceItem[] })
      };
    });
  }
  return report;
}
