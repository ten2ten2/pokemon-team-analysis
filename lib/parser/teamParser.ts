import { Dex } from '@pkmn/dex';
import { Generations, Moves, type Move, type Specie } from '@pkmn/data';
import { type PokemonSet } from '@pkmn/sets';
import { Dex as SimDex, Teams, TeamValidator } from '@pkmn/sim';

import { calculateStats } from '../calculator/statsCalculator';
import idMapping from '~/data/pokemon-id-mapping.json';
import { initializeFormats } from './formatInitializer';
import { normalizeName } from '~/utils/teamUtils';
import type { Pokemon } from '~/types/pokemon';
import { DEFAULT_GAME_VERSION, GENERATION_MAP } from '~/types/team';

// ==================== 缓存和常量 ====================

// 缓存 Generation 对象避免重复创建
const generationCache = new Map<number, ReturnType<Generations['get']>>();

// 默认等级
const DEFAULT_LEVEL = 50;

// 类型映射缓存 (避免重复类型转换)
const idMappingCache = idMapping as Record<string, number>;

// ==================== 工具函数 ====================

/**
 * 获取缓存的世代数据
 */
function getCachedGeneration(genNum: number = GENERATION_MAP[DEFAULT_GAME_VERSION]) {
  if (!generationCache.has(genNum)) {
    const gen = new Generations(Dex).get(genNum);
    generationCache.set(genNum, gen);
  }
  return generationCache.get(genNum)!;
}

// ==================== 主要函数 ====================

/**
 * 解析队伍并验证队伍是否符合规则
 * @param teamRawString - 原始队伍字符串
 * @param rule - 规则字符串
 * @param genNum - 世代号 (默认为 9)
 * @returns 解析结果
 */
export function parseAndValidateTeam(
  teamRawString: string,
  rule: string,
  genNum: number = GENERATION_MAP[DEFAULT_GAME_VERSION]
): { team: Pokemon[] | null, errors: string[] | null } {
  try {
    // 确保格式已正确初始化 (幂等操作)
    initializeFormats();

    // 解析队伍数据
    const teamParsed = Teams.import(teamRawString);
    if (!teamParsed || !Array.isArray(teamParsed) || teamParsed.length === 0) {
      return { team: null, errors: ['Invalid team data format'] };
    }

    // 创建深拷贝以避免 validateTeam 修改原始数据
    const teamForValidation = JSON.parse(JSON.stringify(teamParsed));

    // 验证队伍规则
    const validator = new TeamValidator(rule, SimDex);
    const validationResult = validator.validateTeam(teamForValidation);

    if (validationResult && validationResult.length > 0) {
      return { team: null, errors: validationResult };
    }

    // 使用原始数据进行补充处理
    const completedTeam = completeTeam(teamParsed as PokemonSet<string>[], genNum);
    return { team: completedTeam, errors: null };

  } catch (error) {
    console.error('Team parsing failed:', error);
    return {
      team: null,
      errors: [`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * 补充队伍信息
 */
function completeTeam(teamParsed: PokemonSet<string>[], genNum: number): Pokemon[] {
  const gen = getCachedGeneration(genNum);
  const moves = gen.moves;

  // 批量获取所有物种数据
  const teamSpecies = teamParsed.map(pkm => {
    const specie = gen.species.get(pkm.species);
    if (!specie) {
      console.warn(`Species not found: ${pkm.species}`);
    }
    return specie;
  });

  // 并行处理每个宝可梦
  return teamParsed.map((pkm, index) => {
    const specie = teamSpecies[index];
    if (!specie) {
      throw new Error(`Failed to find species data for: ${pkm.species}`);
    }
    return completeSinglePokemon(pkm, specie, moves);
  });
}

/**
 * 补充单个宝可梦信息
 */
function completeSinglePokemon(pkm: PokemonSet, specie: Specie, moves: Moves): Pokemon {
  // 安全获取必要数据
  const types = specie.types ?? [];
  const baseStats = specie.baseStats;

  // 验证必要数据
  if (!baseStats) {
    console.warn(`Missing baseStats for ${pkm.species}, using default values`);
  }

  // 批量处理招式详情
  const movesDetails = pkm.moves.reduce((acc, move) => {
    const moveDetail = moves.get(move);
    if (moveDetail) {
      acc[move] = moveDetail;
    } else {
      console.warn(`Move not found: ${move}`);
    }
    return acc;
  }, {} as Record<string, Move>);

  // 安全计算种族值 (添加错误处理)
  let calculatedStats;
  try {
    calculatedStats = calculateStats(baseStats, pkm.ivs, pkm.evs, pkm.level || DEFAULT_LEVEL, pkm.nature);
  } catch (error) {
    console.error(`Stats calculation failed for ${pkm.species}:`, error);
    // 使用默认值或基础值
    calculatedStats = baseStats || {
      hp: 175, atk: 120, def: 120, spa: 120, spd: 120, spe: 120
    };
  }

  return {
    ...pkm,
    types,
    pokeApiNum: getPokeApiNum(pkm.species, specie.num),
    movesDetails,
    baseStats: baseStats || { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
    stats: calculatedStats,
  };
}

/**
 * 获取 PokeAPI 编号
 */
function getPokeApiNum(name: string, nationalId: number): number {
  const pokemonName = normalizeName(name);

  // 直接使用缓存的映射，避免重复类型转换
  return idMappingCache[pokemonName] ?? nationalId;
}

// ==================== 缓存清理 ====================

/**
 * 清理缓存 (调试用/内存管理)
 */
export function clearParserCache(): void {
  generationCache.clear();
}
