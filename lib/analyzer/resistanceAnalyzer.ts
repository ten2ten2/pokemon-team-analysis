import type { TypeName } from '@pkmn/types'
import { BaseAnalyzer } from '~/lib/analyzer/baseAnalyzer'
import {
  IMMUNITY_ABILITIES,
  ITEM_EFFECTS,
  RING_TARGET_EFFECTS,
  SPECIAL_ABILITIES,
  TERRAIN_EFFECTS,
  TERRIAN_TYPES,
  WEATHER_EFFECTS,
} from '~/lib/core/constants'
import type { Pokemon } from '~/lib/core/types'
import { isOnTerrain } from '~/lib/core/utils'

// ==================== Types ====================

export interface ResistanceAnalysisOptions {
  weather?: string
  terrain?: string
  terastallization?: {
    index: number
    teraType: string
  }
}

export interface ResistanceAnalysisResult {
  summary: ResistanceSummary
  typeResistances: TypeResistanceData[]
  pokemonData: ResistanceItem[]
}

export interface ResistanceSummary {
  totalTypes: number
  teamSize: number
  weaknesses: { type: string; pokemons: ResistanceItem[] }[]
  resistances: { type: string; pokemons: ResistanceItem[] }[]
  immunities: { type: string; pokemons: ResistanceItem[] }[]
}

export interface TypeResistanceData {
  type: string
  multipliers: { [multiplier: number]: ResistanceItem[] };
  pokemonMultipliers: { [pokemonIndex: number]: number }; // 快速查找特定宝可梦的倍率
  resistanceLevel: number; // 抗性等级 (-6 到 +6)
}

export interface ResistanceItem {
  name: string;
  ability?: string;
  item?: string;
  species: string;
  index: number; // 宝可梦在队伍中的索引
  isTerastallized?: boolean; // 是否太晶化
  teraType?: string; // 太晶属性
}

// ==================== Resistance Analyzer ====================

export class ResistanceAnalyzer extends BaseAnalyzer<ResistanceAnalysisResult, ResistanceAnalysisOptions> {

  getAnalysisType(): string {
    return 'resistance'
  }

  analyze(team: Pokemon[], options?: ResistanceAnalysisOptions): ResistanceAnalysisResult {
    const pokemonData = this.createPokemonData(team, options?.terastallization)
    const typeList = this.getTypeList(options?.terrain);
    const typeResistances = this.calculateTypeResistances(pokemonData, typeList, options?.terrain);

    // 应用天气和场地效果
    if (options?.weather || options?.terrain) {
      this.applyEnvironmentEffects(typeResistances, options?.weather, options?.terrain);
    }

    const summary = this.generateSummary(typeResistances, pokemonData);

    return {
      summary,
      typeResistances,
      pokemonData
    }
  }

  // 创建宝可梦数据数组
  private createPokemonData(
    team: Pokemon[],
    terastallization?: { index: number; teraType: string }
  ): ResistanceItem[] {
    return team.map((pokemon, index) => ({
      name: pokemon.species,
      ability: pokemon.ability,
      item: pokemon.item,
      species: pokemon.species,
      index,
      isTerastallized: terastallization?.index === index,
      teraType: terastallization?.index === index ? terastallization.teraType : undefined
    }));
  }

  // 计算抗性数据
  private calculateTypeResistances(
    pokemonData: ResistanceItem[],
    typeList: string[],
    terrain?: string
  ): TypeResistanceData[] {
    return typeList.map(attackType => {
      const multipliers: { [multiplier: number]: ResistanceItem[] } = {};
      const pokemonMultipliers: { [index: number]: number } = {};
      let resistanceLevel = 0;

      pokemonData.forEach(pokemon => {
        let multiplier: number;

        // 检查是否是场地特定的攻击类型
        if (this.isTerrainSpecificType(attackType)) {
          multiplier = this.calculateTerrainSpecificResistance(pokemon, attackType, terrain as string);
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
          resistanceLevel += 1; // 抵抗
        } else if (multiplier > 1) {
          resistanceLevel -= 1; // 弱点
        }
      });

      return {
        type: attackType,
        multipliers,
        pokemonMultipliers,
        resistanceLevel
      };
    });
  }

  // 获取所有属性类型（包括场地特定的属性）
  private getTypeList(terrain?: string): string[] {
    const allTypes = Array.from(this.dataService.getGeneration().types, (t: any) => t.name);
    const regularTypes = allTypes.filter(type => type !== 'Stellar');
    const stellarType = allTypes.find(type => type === 'Stellar');

    let typeList = stellarType ? [...regularTypes, stellarType] : regularTypes;

    // 为特定场地添加地面上的攻击类型
    if (terrain) {
      const terrainSpecificType = TERRIAN_TYPES[terrain];
      // 将场地特定类型插入到对应的基础类型后面
      if (terrainSpecificType) {
        const baseIndex = typeList.indexOf(terrainSpecificType.baseType);
        if (baseIndex !== -1) {
          typeList.splice(baseIndex + 1, 0, terrainSpecificType.terrainType);
        }
      }
    }

    return typeList;
  }

  // 检查是否是场地特定的攻击类型
  private isTerrainSpecificType(attackType: string): boolean {
    return attackType.includes('(Grounded)');
  }

  // 计算场地特定攻击的抗性倍率
  private calculateTerrainSpecificResistance(
    pokemon: ResistanceItem,
    attackType: string,
    terrain: string
  ): number {
    // 提取基础属性类型
    const baseType = attackType.replace(' (Grounded)', '');

    // 通过species获取完整的宝可梦数据
    const pokemonSpecies = this.dataService.getGeneration().species.get(pokemon.species);
    let pokemonTypes = pokemonSpecies?.types ?? [];

    // 如果宝可梦太晶化了，属性变为太晶属性
    if (pokemon.isTerastallized && pokemon.teraType) {
      pokemonTypes = [pokemon.teraType as TypeName];
    }

    // 计算基础抗性
    let multiplier = this.calculatePokemonResistance(pokemon, baseType);

    // 只有地面上的宝可梦才受到场地效果影响
    if (terrain) {
      const terrainMultiplier = TERRAIN_EFFECTS[terrain][baseType] ?? 1;
      multiplier *= terrainMultiplier;
    }

    return multiplier;
  }

  // 计算单个宝可梦对特定属性的抗性倍率
  private calculatePokemonResistance(pokemon: ResistanceItem, attackType: string): number {
    // 通过species获取完整的宝可梦数据
    const pokemonSpecies = this.dataService.getGeneration().species.get(pokemon.species);
    const originalTypes = pokemonSpecies?.types ?? [];
    let pokemonTypes = originalTypes;

    // 如果宝可梦太晶化了，属性变为太晶属性
    if (pokemon.isTerastallized && pokemon.teraType) {
      pokemonTypes = [pokemon.teraType as TypeName];
    }

    // 特殊处理：Stellar属性的抗性计算
    // 对Stellar属性攻击基础倍率为×2
    if (attackType === 'Stellar') {
      return this.calculateStellarResistance(pokemon);
    }

    // 特殊处理：宝可梦太晶化为Stellar属性时对其他属性的抗性
    if (pokemon.isTerastallized && pokemon.teraType === 'Stellar' && attackType !== 'Stellar') {
      // 当宝可梦太晶化为Stellar属性时，对所有属性攻击（除Stellar外）使用原本属性计算基础倍率
      pokemonTypes = originalTypes;
    }

    // 1. 计算基础属性抗性
    let baseMult = this.dataService.getGeneration().types.totalEffectiveness(attackType as TypeName, pokemonTypes);

    // 2. 处理标靶道具的特殊效果
    baseMult = this.handleRingTargetEffect(pokemon, attackType, pokemonTypes);

    // 3. 计算特性影响
    let abilityMult = this.getAbilityMultiplier(pokemon.ability, attackType);

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
    const itemMult = this.getItemMultiplier(pokemon.item, attackType);

    return baseMult * abilityMult * itemMult;
  }

  // 计算Stellar属性的特殊抗性
  // Stellar属性攻击规则：
  // - 普通宝可梦：基础倍率 ×1
  // - 太晶化的宝可梦：基础倍率 ×2
  // - 太晶化为Stellar属性的宝可梦：基础倍率 ×2
  private calculateStellarResistance(
    pokemon: ResistanceItem,
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
    const abilityMult = this.getAbilityMultiplier(pokemon.ability, 'Stellar');
    const itemMult = this.getItemMultiplier(pokemon.item, 'Stellar');

    return baseMult * abilityMult * itemMult;
  }

  // 获取特性对特定属性的倍率修正
  private getAbilityMultiplier(ability: string | undefined, attackType: string): number {
    if (!ability) return 1;

    // 检查免疫特性
    if (IMMUNITY_ABILITIES[ability]?.includes(attackType) ?? false) {
      return 0;
    }

    // 检查特殊效果特性
    const specialEffect = SPECIAL_ABILITIES[ability];
    if (specialEffect && attackType in specialEffect) {
      return specialEffect[attackType];
    }

    return 1;
  }

  // 获取道具对特定属性的倍率修正
  private getItemMultiplier(item: string | undefined, attackType: string): number {
    if (!item) return 1;

    // 检查免疫效果
    if (ITEM_EFFECTS[item]?.immunities?.includes(attackType) ?? false) {
      return 0;
    }

    // 检查倍率修正
    const itemEffect = ITEM_EFFECTS[item];
    if (itemEffect?.multipliers && attackType in itemEffect.multipliers) {
      return itemEffect.multipliers[attackType];
    }

    return 1;
  }

  // 处理黑色铁球的特殊效果
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

    if (pokemonTypes.includes('Flying')) {
      newBaseMult = 1;
    } else if (pokemon.ability === 'Levitate') {
      newAbilityMult = 1;
    }

    return { baseMult: newBaseMult, abilityMult: newAbilityMult };
  }

  // 处理标靶道具的特殊效果
  private handleRingTargetEffect(
    pokemon: ResistanceItem,
    attackType: string,
    pokemonTypes: string[]
  ): number {
    if (pokemon.item !== 'Ring Target') {
      return this.dataService.getGeneration().types.totalEffectiveness(attackType as TypeName, pokemonTypes as TypeName[]);
    }

    const targetType = RING_TARGET_EFFECTS[attackType];
    if (targetType && pokemonTypes.includes(targetType)) {
      const filteredTypes = pokemonTypes.filter(type => type !== targetType);
      return this.dataService.getGeneration().types.totalEffectiveness(attackType as TypeName, filteredTypes as TypeName[]);
    }

    return this.dataService.getGeneration().types.totalEffectiveness(attackType as TypeName, pokemonTypes as TypeName[]);
  }

  // 应用天气和场地效果
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
      if (terrain && !this.isTerrainSpecificType(typeData.type)) {
        this.applyTerrainEffects(typeData, terrain);
      }
    });
  }

  // 应用天气效果
  private applyWeatherEffects(typeData: TypeResistanceData, weather: string): void {
    const weatherMultiplier = WEATHER_EFFECTS[weather][typeData.type] ?? 1;
    if (weatherMultiplier === 1) return;

    const newMultipliers: { [multiplier: number]: ResistanceItem[] } = {};
    const newPokemonMultipliers: { [pokemonIndex: number]: number } = {};
    let newResistanceLevel = 0;

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
          newResistanceLevel += 1; // 抵抗
        } else if (finalMult > 1) {
          newResistanceLevel -= 1; // 弱点
        }
      });
    });

    typeData.multipliers = newMultipliers;
    typeData.pokemonMultipliers = newPokemonMultipliers;
    typeData.resistanceLevel = newResistanceLevel;
  }

  // 应用场地效果（仅对薄雾气场地的龙属性攻击）
  private applyTerrainEffects(typeData: TypeResistanceData, terrain: string): void {
    // 只有薄雾气场地对龙属性攻击有影响
    if (terrain !== 'Misty Terrain' || typeData.type !== 'Dragon') return;

    const terrainMultiplier = TERRAIN_EFFECTS[terrain][typeData.type] ?? 1;
    if (terrainMultiplier === 1) return;

    const newMultipliers: { [multiplier: number]: ResistanceItem[] } = {};
    const newPokemonMultipliers: { [pokemonIndex: number]: number } = {};
    let newResistanceLevel = 0;

    Object.entries(typeData.multipliers).forEach(([mult, pokemons]) => {
      const originalMult = parseFloat(mult);

      pokemons.forEach(pokemon => {
        let finalMult = originalMult;

        // 通过species获取完整的宝可梦数据
        const pokemonSpecies = this.dataService.getGeneration().species.get(pokemon.species);
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
          newResistanceLevel += 1; // 抵抗
        } else if (finalMult > 1) {
          newResistanceLevel -= 1; // 弱点
        }
      });
    });

    typeData.multipliers = newMultipliers;
    typeData.pokemonMultipliers = newPokemonMultipliers;
    typeData.resistanceLevel = newResistanceLevel;
  }

  // 生成分析摘要
  private generateSummary(
    typeResistances: TypeResistanceData[],
    pokemonData: ResistanceItem[]
  ): ResistanceSummary {
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

// ==================== Export ====================

export const resistanceAnalyzer = new ResistanceAnalyzer()
export default resistanceAnalyzer
