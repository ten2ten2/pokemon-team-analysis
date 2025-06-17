import { type PokemonSet } from '@pkmn/sets';
import { Teams, TeamValidator } from '@pkmn/sim';
import { Generations, type Specie } from '@pkmn/data';
import { Dex } from '@pkmn/dex';
import type { Pokemon } from '~/types/pokemon';

// 解析队伍并验证队伍是否符合规则
export function parseAndValidateTeam(teamRawString: string, rule: string): { team: Pokemon[] | null, errors: string[] | null } {
  const teamParsed = Teams.import(teamRawString);
  const validator = new TeamValidator(rule);
  const result = validator.validateTeam(teamParsed);
  if (result) {
    return { team: null, errors: result };
  }
  return { team: completeTeam(teamParsed as PokemonSet<string>[], 9), errors: null };
}

// 补充队伍信息
function completeTeam(teamParsed: PokemonSet<string>[], genNum: number): Pokemon[] {
  const gen = new Generations(Dex).get(genNum);
  const teamSpecies = teamParsed.map(pkm => gen.species.get(pkm.species));
  return teamParsed.map((pkm, index) => completeSinglePokemon(pkm, teamSpecies[index]!));
}

// 补充单个宝可梦信息
function completeSinglePokemon(pkm: PokemonSet, specie: Specie): Pokemon {
  const types = specie.types ?? [];
  return {
    ...pkm,
    types,
    // todo 根据是否闪光以及地区形态，选择不同的 num
    pokeapiNum: specie.num,
  };
}
