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
  getTerrainMultiplier,
  isOnTerrain,
} from './resistanceUtils';

// ==================== 类型定义 ====================

export interface ResistanceItem {
  name: string;
  ability?: string;
  item?: string;
  species: string;
  index: number; // 宝可梦在队伍中的索引
  isTerastallized?: boolean; // 是否太晶化
  teraType?: string; // 太晶属性
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
    terastallization?: { pokemonIndex: number; teraType: string }; // 太晶化信息
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
  analyze(
    team: Team,
    weather?: string,
    terrain?: string,
    terastallization?: { pokemonIndex: number; teraType: string }
  ): ResistanceAnalysisResult {
    const pokemonList = Array.from(team.team);
    const pokemonData = this.createPokemonData(pokemonList, terastallization);
    const typeList = this.getTypeList(terrain);
    const typeResistances = this.calculateTypeResistances(pokemonData, typeList, terrain);

    // 应用天气和场地效果
    if (weather || terrain) {
      this.applyEnvironmentEffects(typeResistances, pokemonData, weather, terrain);
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
        terastallization,
        calculatedAt: new Date()
      }
    };
  }

  /**
   * 创建宝可梦数据数组
   */
  private createPokemonData(
    pokemonList: (PokemonSet | Partial<PokemonSet>)[],
    terastallization?: { pokemonIndex: number; teraType: string }
  ): ResistanceItem[] {
    return pokemonList.map((pokemon, index) => ({
      name: getPokemonDisplayName(pokemon),
      ability: pokemon.ability,
      item: pokemon.item,
      species: pokemon.species || 'Unknown',
      index,
      isTerastallized: terastallization?.pokemonIndex === index,
      teraType: terastallization?.pokemonIndex === index ? terastallization.teraType : undefined
    }));
  }

  /**
   * 获取所有属性类型（包括场地特定的属性）
   */
  private getTypeList(terrain?: string): string[] {
    const allTypes = Array.from(this.gen.types, (t: any) => t.name);
    const regularTypes = allTypes.filter(type => type !== 'Stellar');
    const stellarType = allTypes.find(type => type === 'Stellar');

    let typeList = stellarType ? [...regularTypes, stellarType] : regularTypes;

    // 为特定场地添加地面上的攻击类型
    if (terrain) {
      const terrainSpecificTypes = this.getTerrainSpecificTypes(terrain);
      // 将场地特定类型插入到对应的基础类型后面
      terrainSpecificTypes.forEach(({ baseType, terrainType }) => {
        const baseIndex = typeList.indexOf(baseType);
        if (baseIndex !== -1) {
          typeList.splice(baseIndex + 1, 0, terrainType);
        }
      });
    }

    return typeList;
  }

  /**
   * 获取场地特定的攻击类型
   */
  private getTerrainSpecificTypes(terrain: string): { baseType: string; terrainType: string }[] {
    const terrainTypes: { [key: string]: { baseType: string; terrainType: string }[] } = {
      'Electric Terrain': [{ baseType: 'Electric', terrainType: 'Electric (Grounded)' }],
      'Grassy Terrain': [{ baseType: 'Grass', terrainType: 'Grass (Grounded)' }],
      'Psychic Terrain': [{ baseType: 'Psychic', terrainType: 'Psychic (Grounded)' }],
    };

    return terrainTypes[terrain] || [];
  }

  /**
   * 计算所有属性的抗性数据
   */
  private calculateTypeResistances(
    pokemonData: ResistanceItem[],
    typeList: string[],
    terrain?: string
  ): TypeResistanceData[] {
    return typeList.map(attackType => {
      const multipliers: { [multiplier: number]: ResistanceItem[] } = {};
      const pokemonMultipliers: { [pokemonIndex: number]: number } = {};
      let teamResistanceLevel = 0;

      pokemonData.forEach(pokemon => {
        let multiplier: number;

        // 检查是否是场地特定的攻击类型
        if (this.isTerrainSpecificType(attackType)) {
          multiplier = this.calculateTerrainSpecificResistance(pokemon, attackType, terrain);
        } else {
          multiplier = this.calculatePokemonResistance(pokemon, attackType);
        }

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
   * 检查是否是场地特定的攻击类型
   */
  private isTerrainSpecificType(attackType: string): boolean {
    return attackType.includes('(Grounded)');
  }

  /**
   * 计算场地特定攻击的抗性倍率
   */
  private calculateTerrainSpecificResistance(
    pokemon: ResistanceItem,
    attackType: string,
    terrain?: string
  ): number {
    // 提取基础属性类型
    const baseType = attackType.replace(' (Grounded)', '');

    // 通过species获取完整的宝可梦数据
    const pokemonSpecies = this.species.get(pokemon.species);
    let pokemonTypes = pokemonSpecies?.types ?? [];

    // 如果宝可梦太晶化了，属性变为太晶属性
    if (pokemon.isTerastallized && pokemon.teraType) {
      pokemonTypes = [pokemon.teraType];
    }

    // 计算基础抗性
    let multiplier = this.calculatePokemonResistance(pokemon, baseType);

    // 检查宝可梦是否在地面上（这里要使用原始属性，因为太晶化不影响是否在地面上）
    const originalPokemonTypes = pokemonSpecies?.types ?? [];
    const onTerrain = isOnTerrain(originalPokemonTypes, pokemon.ability || '', pokemon.item || '');

    // 只有地面上的宝可梦才受到场地效果影响
    if (onTerrain && terrain) {
      const terrainMultiplier = getTerrainMultiplier(terrain, baseType);
      multiplier *= terrainMultiplier;
    }

    return multiplier;
  }

  /**
   * 计算单个宝可梦对特定属性的抗性倍率
   */
  private calculatePokemonResistance(pokemon: ResistanceItem, attackType: string): number {
    // 通过species获取完整的宝可梦数据
    const pokemonSpecies = this.species.get(pokemon.species);
    const originalTypes = pokemonSpecies?.types ?? [];
    let pokemonTypes = originalTypes;

    // 如果宝可梦太晶化了，属性变为太晶属性
    if (pokemon.isTerastallized && pokemon.teraType) {
      pokemonTypes = [pokemon.teraType];
    }

    // 特殊处理：Stellar属性的抗性计算
    if (attackType === 'Stellar') {
      return this.calculateStellarResistance(pokemon, pokemonTypes, originalTypes);
    }

    // 特殊处理：宝可梦太晶化为Stellar属性时对其他属性的抗性
    if (pokemon.isTerastallized && pokemon.teraType === 'Stellar' && attackType !== 'Stellar') {
      // 当宝可梦太晶化为Stellar属性时，对所有属性攻击（除Stellar外）使用原本属性计算基础倍率
      pokemonTypes = originalTypes;

      // 但对Stellar属性攻击基础倍率为×2（已在上面的Stellar处理中实现）
    }

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
   * 计算Stellar属性的特殊抗性
   * Stellar属性攻击规则：
   * - 普通宝可梦：基础倍率 ×1
   * - 太晶化的宝可梦：基础倍率 ×2
   * - 太晶化为Stellar属性的宝可梦：基础倍率 ×2
   */
  private calculateStellarResistance(
    pokemon: ResistanceItem,
    currentTypes: string[],
    originalTypes: string[]
  ): number {
    let baseMult: number;

    // 攻击属性为Stellar时的规则
    if (pokemon.isTerastallized) {
      // 太晶化的宝可梦受到Stellar攻击时基础倍率为×2
      // 包括太晶化为Stellar属性的宝可梦
      baseMult = 2;
    } else {
      // 普通宝可梦受到Stellar攻击时基础倍率为×1
      baseMult = 1;
    }

    // 应用特性和道具效果
    const abilityMult = getAbilityMultiplier(pokemon.ability, 'Stellar');
    const itemMult = getItemMultiplier(pokemon.item, 'Stellar');

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
    pokemonData: ResistanceItem[],
    weather?: string,
    terrain?: string
  ): void {
    if (!weather && !terrain) return;

    typeResistances.forEach(typeData => {
      if (weather) {
        this.applyWeatherEffects(typeData, weather);
      }
      if (terrain && !this.isTerrainSpecificType(typeData.type)) {
        this.applyTerrainEffects(typeData, terrain, pokemonData);
      }
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
    let newTeamResistanceLevel = 0;

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

        // 重新计算队伍抗性等级
        if (finalMult < 1) {
          newTeamResistanceLevel += 1; // 抵抗
        } else if (finalMult > 1) {
          newTeamResistanceLevel -= 1; // 弱点
        }
      });
    });

    typeData.multipliers = newMultipliers;
    typeData.pokemonMultipliers = newPokemonMultipliers;
    typeData.teamResistanceLevel = newTeamResistanceLevel;
  }

  /**
 * 应用场地效果（仅对薄雾气场地的龙属性攻击）
 */
  private applyTerrainEffects(
    typeData: TypeResistanceData,
    terrain: string,
    pokemonData: ResistanceItem[]
  ): void {
    // 只有薄雾气场地对龙属性攻击有影响
    if (terrain !== 'Misty Terrain' || typeData.type !== 'Dragon') return;

    const terrainMultiplier = getTerrainMultiplier(terrain, typeData.type);
    if (terrainMultiplier === 1) return;

    const newMultipliers: { [multiplier: number]: ResistanceItem[] } = {};
    const newPokemonMultipliers: { [pokemonIndex: number]: number } = {};
    let newTeamResistanceLevel = 0;

    Object.entries(typeData.multipliers).forEach(([mult, pokemons]) => {
      const originalMult = parseFloat(mult);

      pokemons.forEach(pokemon => {
        let finalMult = originalMult;

        // 通过species获取完整的宝可梦数据
        const pokemonSpecies = this.species.get(pokemon.species);
        // 检查宝可梦是否在地面上（使用原始属性，太晶化不影响是否在地面上）
        const originalPokemonTypes = pokemonSpecies?.types ?? [];

        // 检查宝可梦是否在地面上
        const onTerrain = isOnTerrain(originalPokemonTypes, pokemon.ability || '', pokemon.item || '');

        if (onTerrain) {
          finalMult = originalMult * terrainMultiplier;
        } else {
          finalMult = originalMult;
        }

        newPokemonMultipliers[pokemon.index] = finalMult;

        if (!newMultipliers[finalMult]) {
          newMultipliers[finalMult] = [];
        }
        newMultipliers[finalMult].push(pokemon);

        // 重新计算队伍抗性等级
        if (finalMult < 1) {
          newTeamResistanceLevel += 1; // 抵抗
        } else if (finalMult > 1) {
          newTeamResistanceLevel -= 1; // 弱点
        }
      });
    });

    typeData.multipliers = newMultipliers;
    typeData.pokemonMultipliers = newPokemonMultipliers;
    typeData.teamResistanceLevel = newTeamResistanceLevel;
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
