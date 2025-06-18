import { type PokemonSet } from '@pkmn/sets';
import { Dex as SimDex, Teams, TeamValidator } from '@pkmn/sim';
import { Generations, Moves, type Move, type Specie } from '@pkmn/data';
import { Dex } from '@pkmn/dex';
import type { Pokemon } from '~/types/pokemon';
import { initializeFormats } from './formatInitializer';
import idMapping from '~/data/pokemon-id-mapping.json';

// 解析队伍并验证队伍是否符合规则
export function parseAndValidateTeam(teamRawString: string, rule: string): { team: Pokemon[] | null, errors: string[] | null } {
  // 确保格式已正确初始化（幂等操作）
  initializeFormats();

  const teamParsed = Teams.import(teamRawString);

  // 创建深拷贝以避免 validateTeam 修改原始数据
  const teamForValidation = JSON.parse(JSON.stringify(teamParsed));

  const validator = new TeamValidator(rule, SimDex);
  const result = validator.validateTeam(teamForValidation);

  if (result) {
    return { team: null, errors: result };
  }

  // 使用原始的 teamParsed（未被修改）进行后续处理
  return { team: completeTeam(teamParsed as PokemonSet<string>[], 9), errors: null };
}

// 补充队伍信息
function completeTeam(teamParsed: PokemonSet<string>[], genNum: number): Pokemon[] {
  const gen = new Generations(Dex).get(genNum);
  const moves = gen.moves;
  const teamSpecies = teamParsed.map(pkm => gen.species.get(pkm.species));
  return teamParsed.map((pkm, index) => completeSinglePokemon(pkm, teamSpecies[index]!, moves));
}

// 补充单个宝可梦信息
function completeSinglePokemon(pkm: PokemonSet, specie: Specie, moves: Moves): Pokemon {
  const types = specie.types ?? [];
  return {
    ...pkm,
    types,
    // todo 根据是否闪光以及地区形态，选择不同的 num
    // 使用 pokemon-id-mapping.json 的映射获取正确的 ID
    // 如果映射中不存在，则使用 specie.num
    pokeapiNum: (() => {
      const pokemonName = pkm.species.toLowerCase().replace(/[^a-z0-9 \-]/g, '').replace(/ +/g, '-');
      // 动态导入映射数据
      try {
        // 尝试从映射中获取 ID
        return (idMapping as Record<string, number>)[pokemonName] || specie.num;
      } catch (error) {
        // 如果导入失败，回退到使用 specie.num
        return specie.num;
      }
    })(),
    movesDetails: (() => {
      return pkm.moves.reduce((acc, move) => {
        const moveDetail = moves.get(move);
        console.log('moveDetail', moveDetail);
        if (moveDetail) {
          acc[move] = moveDetail;
        }
        return acc;
      }, {} as Record<string, Move>);
    })(),
  };
}
