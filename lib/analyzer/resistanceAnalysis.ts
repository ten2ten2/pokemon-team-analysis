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
  species: string;
  index: number; // 宝可梦在队伍中的索引
}

export interface TypeResistanceData {
  type: string;
  multipliers: { [multiplier: number]: ResistanceItem[] };
  pokemonMultipliers: { [pokemonIndex: number]: number }; // 快速查找特定宝可梦的倍率
  teamResistanceLevel: number; // 队伍整体抗性等级 (-6 到 +6)
}

export interface ResistanceAnalysisResult {
  typeResistances: TypeResistanceData[];
  pokemonData: ResistanceItem[];
  summary: {
    totalTypes: number;
    teamSize: number;
    weaknesses: { type: string; count: number; pokemons: ResistanceItem[] }[];
    resistances: { type: string; count: number; pokemons: ResistanceItem[] }[];
    immunities: { type: string; count: number; pokemons: ResistanceItem[] }[];
  };
  metadata: {
    generation: number;
    weather?: string;
    terrain?: string;
    calculatedAt: Date;
  };
}

// ==================== 数据处理类 ====================

export class ResistanceAnalyzer {
  private gen: any;
  private types: any;
  private species: any;
  private generation: number;

  constructor(genNum: number = 9) {
    this.generation = genNum;
    this.gen = new Generations(Dex).get(genNum);
    this.types = this.gen.types;
    this.species = this.gen.species;
  }

  /**
   * 分析队伍的完整抗性数据
   */
  analyze(team: Team, weather?: string, terrain?: string): ResistanceAnalysisResult {
    const pokemonList = Array.from(team.team);
    const pokemonData = this.createPokemonData(pokemonList);
    const typeList = this.getTypeList();
    const typeResistances = this.calculateTypeResistances(pokemonData, typeList);

    // 应用天气和场地效果
    if (weather || terrain) {
      this.applyEnvironmentEffects(typeResistances, weather, terrain);
    }

    const summary = this.generateSummary(typeResistances, pokemonData);

    return {
      typeResistances,
      pokemonData,
      summary,
      metadata: {
        generation: this.generation,
        weather,
        terrain,
        calculatedAt: new Date()
      }
    };
  }

  /**
   * 创建宝可梦数据数组
   */
  private createPokemonData(pokemonList: (PokemonSet | Partial<PokemonSet>)[]): ResistanceItem[] {
    return pokemonList.map((pokemon, index) => ({
      name: getPokemonDisplayName(pokemon),
      ability: pokemon.ability,
      item: pokemon.item,
      species: pokemon.species || 'Unknown',
      index
    }));
  }

  /**
   * 获取所有属性类型（排除星晶属性）
   */
  private getTypeList(): string[] {
    return Array.from(this.gen.types, (t: any) => t.name).filter(
      type => type !== 'Stellar'
    );
  }

  /**
   * 计算所有属性的抗性数据
   */
  private calculateTypeResistances(
    pokemonData: ResistanceItem[],
    typeList: string[]
  ): TypeResistanceData[] {
    return typeList.map(attackType => {
      const multipliers: { [multiplier: number]: ResistanceItem[] } = {};
      const pokemonMultipliers: { [pokemonIndex: number]: number } = {};
      let teamResistanceLevel = 0;

      pokemonData.forEach(pokemon => {
        const multiplier = this.calculatePokemonResistance(pokemon, attackType);

        // 存储倍率映射
        pokemonMultipliers[pokemon.index] = multiplier;

        // 按倍率分组
        if (!multipliers[multiplier]) {
          multipliers[multiplier] = [];
        }
        multipliers[multiplier].push(pokemon);

        // 计算队伍抗性等级
        if (multiplier < 1) {
          teamResistanceLevel += 1; // 抵抗
        } else if (multiplier > 1) {
          teamResistanceLevel -= 1; // 弱点
        }
      });

      return {
        type: attackType,
        multipliers,
        pokemonMultipliers,
        teamResistanceLevel
      };
    });
  }

  /**
   * 计算单个宝可梦对特定属性的抗性倍率
   */
  private calculatePokemonResistance(pokemon: ResistanceItem, attackType: string): number {
    // 通过species获取完整的宝可梦数据
    const pokemonSpecies = this.species.get(pokemon.species);
    const pokemonTypes = pokemonSpecies?.types ?? [];

    // 1. 计算基础属性抗性
    let baseMult = this.types.totalEffectiveness(attackType, pokemonTypes);

    // 2. 处理标靶道具的特殊效果
    baseMult = this.handleRingTargetEffect(pokemon, attackType, pokemonTypes);

    // 3. 计算特性影响
    let abilityMult = getAbilityMultiplier(pokemon.ability, attackType);

    // 4. 处理黑色铁球的特殊效果
    const ironBallResult = this.handleIronBallEffect(
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
   * 处理黑色铁球的特殊效果
   */
  private handleIronBallEffect(
    pokemon: ResistanceItem,
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

    if (hasType(pokemonTypes, 'Flying')) {
      newBaseMult = 1;
    } else if (pokemon.ability === 'Levitate') {
      newAbilityMult = 1;
    }

    return { baseMult: newBaseMult, abilityMult: newAbilityMult };
  }

  /**
   * 处理标靶道具的特殊效果
   */
  private handleRingTargetEffect(
    pokemon: ResistanceItem,
    attackType: string,
    pokemonTypes: string[]
  ): number {
    if (pokemon.item !== 'Ring Target') {
      return this.types.totalEffectiveness(attackType, pokemonTypes);
    }

    const targetType = RING_TARGET_EFFECTS[attackType];
    if (targetType && hasType(pokemonTypes, targetType)) {
      const filteredTypes = filterTypes(pokemonTypes, targetType);
      return this.types.totalEffectiveness(attackType, filteredTypes);
    }

    return this.types.totalEffectiveness(attackType, pokemonTypes);
  }

  /**
   * 应用天气和场地效果
   */
  private applyEnvironmentEffects(
    typeResistances: TypeResistanceData[],
    weather?: string,
    terrain?: string
  ): void {
    if (!weather && !terrain) return;

    typeResistances.forEach(typeData => {
      if (weather) {
        this.applyWeatherEffects(typeData, weather);
      }
      // TODO: 实现场地效果
    });
  }

  /**
   * 应用天气效果
   */
  private applyWeatherEffects(typeData: TypeResistanceData, weather: string): void {
    const weatherMultiplier = getWeatherMultiplier(weather, typeData.type);
    if (weatherMultiplier === 1) return;

    const newMultipliers: { [multiplier: number]: ResistanceItem[] } = {};
    const newPokemonMultipliers: { [pokemonIndex: number]: number } = {};

    Object.entries(typeData.multipliers).forEach(([mult, pokemons]) => {
      const originalMult = parseFloat(mult);

      pokemons.forEach(pokemon => {
        let finalMult = originalMult;

        // 万能伞特殊处理
        if (pokemon.item === 'Utility Umbrella' &&
          (weather === 'Rain' || weather === 'Harsh Sunlight')) {
          // 万能伞在雨天和晴天下不受天气影响
          finalMult = originalMult;
        } else {
          finalMult = originalMult * weatherMultiplier;
        }

        newPokemonMultipliers[pokemon.index] = finalMult;

        if (!newMultipliers[finalMult]) {
          newMultipliers[finalMult] = [];
        }
        newMultipliers[finalMult].push(pokemon);
      });
    });

    typeData.multipliers = newMultipliers;
    typeData.pokemonMultipliers = newPokemonMultipliers;
  }

  /**
   * 生成分析摘要
   */
  private generateSummary(
    typeResistances: TypeResistanceData[],
    pokemonData: ResistanceItem[]
  ): ResistanceAnalysisResult['summary'] {
    const weaknesses: { type: string; count: number; pokemons: ResistanceItem[]; weightScore: number }[] = [];
    const resistances: { type: string; count: number; pokemons: ResistanceItem[]; weightScore: number }[] = [];
    const immunities: { type: string; count: number; pokemons: ResistanceItem[]; weightScore: number }[] = [];

    typeResistances.forEach(typeData => {
      const weakPokemons: ResistanceItem[] = [];
      const resistPokemons: ResistanceItem[] = [];
      const immunePokemons: ResistanceItem[] = [];
      let weaknessWeight = 0;
      let resistanceWeight = 0;

      Object.entries(typeData.multipliers).forEach(([mult, pokemons]) => {
        const multiplier = parseFloat(mult);
        if (multiplier === 0) {
          immunePokemons.push(...pokemons);
        } else if (multiplier < 1) {
          resistPokemons.push(...pokemons);
          // 抗性权重：越小的倍率权重越高 (1 - multiplier)
          resistanceWeight += pokemons.length * (1 - multiplier);
        } else if (multiplier > 1) {
          weakPokemons.push(...pokemons);
          // 弱点权重：越大的倍率权重越高 (multiplier - 1)
          weaknessWeight += pokemons.length * (multiplier - 1);
        }
      });

      if (weakPokemons.length > 0) {
        weaknesses.push({
          type: typeData.type,
          count: weakPokemons.length,
          pokemons: weakPokemons,
          weightScore: weaknessWeight
        });
      }
      if (resistPokemons.length > 0) {
        resistances.push({
          type: typeData.type,
          count: resistPokemons.length,
          pokemons: resistPokemons,
          weightScore: resistanceWeight
        });
      }
      if (immunePokemons.length > 0) {
        immunities.push({
          type: typeData.type,
          count: immunePokemons.length,
          pokemons: immunePokemons,
          weightScore: immunePokemons.length // 免疫的权重就是数量
        });
      }
    });

    // 排序：首先按数量，数量相同时按权重分数
    const sortByCountAndWeight = (a: { count: number; weightScore: number }, b: { count: number; weightScore: number }) => {
      if (b.count !== a.count) {
        return b.count - a.count; // 数量优先
      }
      return b.weightScore - a.weightScore; // 数量相同时按权重
    };

    return {
      totalTypes: typeResistances.length,
      teamSize: pokemonData.length,
      weaknesses: weaknesses.sort(sortByCountAndWeight),
      resistances: resistances.sort(sortByCountAndWeight),
      immunities: immunities.sort(sortByCountAndWeight)
    };
  }
}

// ==================== 便捷函数 ====================

/**
 * 获取特定宝可梦对特定属性的抗性倍率（优化的查找）
 */
export function getPokemonResistance(
  result: ResistanceAnalysisResult,
  pokemonIndex: number,
  attackType: string
): number {
  const typeData = result.typeResistances.find(t => t.type === attackType);
  return typeData?.pokemonMultipliers[pokemonIndex] ?? 1;
}

/**
 * 获取队伍对特定属性的整体抗性等级
 */
export function getTeamResistanceLevel(
  result: ResistanceAnalysisResult,
  attackType: string
): number {
  const typeData = result.typeResistances.find(t => t.type === attackType);
  return typeData?.teamResistanceLevel ?? 0;
}

/**
 * 获取具有特定倍率的宝可梦列表
 */
export function getPokemonWithMultiplier(
  result: ResistanceAnalysisResult,
  attackType: string,
  multiplier: number
): ResistanceItem[] {
  const typeData = result.typeResistances.find(t => t.type === attackType);
  return typeData?.multipliers[multiplier] ?? [];
}
