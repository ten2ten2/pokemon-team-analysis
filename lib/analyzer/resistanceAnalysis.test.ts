import { Team, type PokemonSet } from '@pkmn/sets';
import { normalizeReport, resistanceAnalysis, resistanceUnderStatus } from './resistanceAnalysis';
import fs from 'fs';
import path from 'path';

// ==================== 测试数据 ====================

const teamExportFormat = `
Incineroar (M) @ Safety Goggles
Ability: Intimidate
Level: 50
Shiny: Yes
Tera Type: Fairy
EVs: 244 HP / 188 Def / 76 SpD
Impish Nature
IVs: 0 Spe
  - U - turn
  - Fake Out
  - Flare Blitz
  - Knock Off

Lunala @ Leftovers
Ability: Shadow Shield
Level: 50
Tera Type: Fairy
EVs: 132 HP / 20 Def / 180 SpA / 172 SpD / 4 Spe
Modest Nature
IVs: 0 Atk
  - Moongeist Beam
  - Moonblast
  - Wide Guard
  - Trick Room

Amoonguss (F) @ Covert Cloak
Ability: Regenerator
Level: 50
Tera Type: Dark
EVs: 236 HP / 196 Def / 76 SpD
Sassy Nature
IVs: 0 Atk / 0 Spe
  - Rage Powder
  - Spore
  - Pollen Puff
  - Protect

Ursaluna (M) @ Flame Orb
Ability: Guts
Level: 50
Tera Type: Ghost
EVs: 140 HP / 252 Atk / 116 SpD
Brave Nature
IVs: 14 SpA / 0 Spe
  - Facade
  - Headlong Rush
  - Earthquake
  - Protect

Koraidon @ Life Orb
Ability: Orichalcum Pulse
Level: 50
Tera Type: Fire
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
  - Flare Blitz
  - Close Combat
  - Flame Charge
  - Protect

Flutter Mane @ Focus Sash
Ability: Protosynthesis
Level: 50
Shiny: Yes
Tera Type: Fairy
EVs: 4 Def / 252 SpA / 252 Spe
Timid Nature
IVs: 3 Atk
  - Moonblast
  - Shadow Ball
  - Icy Wind
  - Protect
`;

// ==================== 测试执行 ====================

/**
 * 运行抗性分析测试
 */
function runResistanceAnalysisTest(): void {
  console.log('🧪 开始运行宝可梦队伍抗性分析测试...\n');

  try {
    // 解析队伍数据
    const teamParsed = Team.import(teamExportFormat) as Team<PokemonSet<string>>;
    console.log('✅ 队伍数据解析成功');

    // 执行抗性分析
    const analysisResult = normalizeReport(resistanceAnalysis(teamParsed, 9));
    console.log('✅ 抗性分析完成');

    // 根据天气和场地状态，返回修正后的抗性报告
    const weather = 'Rain';
    const terrain = 'Electric Terrain';
    const resultUnderStatus = resistanceUnderStatus(analysisResult, weather, terrain);

    // 输出结果
    console.log('\n📊 抗性分析结果:');
    // 将结果写入文件
    // 写入基础分析结果
    fs.writeFileSync(
      path.join('resistance-analysis.json'),
      JSON.stringify(analysisResult, null, 2),
      'utf8'
    );
    console.log('✅ 基础分析结果已写入 output/resistance-analysis.json');

    // 写入天气和场地修正后的结果
    fs.writeFileSync(
      path.join('resistance-analysis-with-status.json'),
      JSON.stringify(resultUnderStatus, null, 2),
      'utf8'
    );
    console.log('✅ 天气和场地修正后的结果已写入 output/resistance-analysis-with-status.json');

    // 简单的结果验证
    const typeCount = Object.keys(analysisResult).length;
    console.log(`\n📈 分析统计:`);
    console.log(`- 分析的属性类型数量: ${typeCount}`);
    console.log(`- 队伍宝可梦数量: ${teamParsed.team.length}`);

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 如果直接运行此文件，则执行测试
// 在ES模块中，我们直接调用测试函数
runResistanceAnalysisTest();

export { runResistanceAnalysisTest };
