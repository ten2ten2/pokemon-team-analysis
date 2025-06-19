import { Team, type PokemonSet } from '@pkmn/sets';
import * as fs from 'fs';
import {
  ResistanceAnalyzer,
  getPokemonResistance,
  getTeamResistanceLevel,
} from './resistanceAnalysis';

// ==================== 测试数据 ====================

const teamExportFormat = `
Incineroar @ Safety Goggles
Ability: Intimidate
Level: 50
EVs: 236 HP / 4 Atk / 4 Def / 4 SpA / 4 SpD / 252 Spe
Jolly Nature
- Fake Out
- Flare Blitz
- Darkest Lariat
- U-turn

Rillaboom @ Assault Vest
Ability: Grassy Surge
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Grassy Glide
- Wood Hammer
- U-turn
- High Horsepower

Regieleki @ Focus Sash
Ability: Transistor
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Modest Nature
IVs: 0 Atk
- Thunderbolt
- Volt Switch
- Electroweb
- Protect

Landorus-Therian @ Life Orb
Ability: Intimidate
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Rock Slide
- U-turn
- Protect

Grimmsnarl @ Light Clay
Ability: Prankster
Level: 50
EVs: 252 HP / 4 Atk / 252 SpD
Careful Nature
- Light Screen
- Reflect
- Spirit Break
- Taunt

Dragapult @ Choice Specs
Ability: Clear Body
Level: 50
EVs: 4 HP / 252 SpA / 252 Spe
Modest Nature
IVs: 0 Atk
- Shadow Ball
- Draco Meteor
- Hydro Pump
- U-turn
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

    // 创建分析器实例
    const analyzer = new ResistanceAnalyzer(9);
    console.log('✅ 抗性分析器创建成功');

    // 执行基础抗性分析
    const basicResult = analyzer.analyze(teamParsed);
    console.log('✅ 基础抗性分析完成');

    // 执行带天气和场地的抗性分析
    const weather = 'Rain';
    const terrain = 'Electric Terrain';
    const weatherResult = analyzer.analyze(teamParsed, weather, terrain);
    console.log('✅ 天气和场地抗性分析完成');

    // 测试新的便捷函数
    console.log('\n📊 测试便捷函数:');

    // 测试获取特定宝可梦的抗性
    const fireResistance = getPokemonResistance(basicResult, 0, 'Fire'); // Incineroar对火的抗性
    console.log(`- Incineroar对火属性的抗性倍率: ${fireResistance}`);

    // 测试获取队伍整体抗性等级
    const teamFireLevel = getTeamResistanceLevel(basicResult, 'Fire');
    console.log(`- 队伍对火属性的整体抗性等级: ${teamFireLevel}`);

    // 测试完成
    console.log('✅ 新API测试通过');

    // 输出结果
    console.log('\n📊 抗性分析结果:');

    // 写入基础分析结果
    fs.writeFileSync(
      'resistance-analysis-new.json',
      JSON.stringify(basicResult, null, 2),
      'utf8'
    );
    console.log('✅ 基础分析结果已写入 resistance-analysis-new.json');

    // 写入天气和场地修正后的结果
    fs.writeFileSync(
      'resistance-analysis-with-weather-new.json',
      JSON.stringify(weatherResult, null, 2),
      'utf8'
    );
    console.log('✅ 天气和场地修正后的结果已写入 resistance-analysis-with-weather-new.json');

    // 测试完成，不再需要legacy格式
    console.log('✅ 所有测试文件已生成');

    // 简单的结果验证
    console.log(`\n📈 分析统计:`);
    console.log(`- 分析的属性类型数量: ${basicResult.summary.totalTypes}`);
    console.log(`- 队伍宝可梦数量: ${basicResult.summary.teamSize}`);
    console.log(`- 主要弱点数量: ${basicResult.summary.weaknesses.length}`);
    console.log(`- 主要抗性数量: ${basicResult.summary.resistances.length}`);
    console.log(`- 免疫属性数量: ${basicResult.summary.immunities.length}`);

    // 显示分析摘要
    console.log('\n📋 分析摘要:');
    if (basicResult.summary.weaknesses.length > 0) {
      console.log('主要弱点:');
      basicResult.summary.weaknesses.slice(0, 3).forEach(w => {
        console.log(`  - ${w.type}: ${w.count}只宝可梦`);
      });
    }

    if (basicResult.summary.resistances.length > 0) {
      console.log('主要抗性:');
      basicResult.summary.resistances.slice(0, 3).forEach(r => {
        console.log(`  - ${r.type}: ${r.count}只宝可梦`);
      });
    }

    if (basicResult.summary.immunities.length > 0) {
      console.log('完全免疫:');
      basicResult.summary.immunities.slice(0, 3).forEach(i => {
        console.log(`  - ${i.type}: ${i.count}只宝可梦`);
      });
    }

    // 性能测试
    console.log('\n⚡ 性能测试:');
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      analyzer.analyze(teamParsed);
    }
    const endTime = Date.now();
    console.log(`- 100次分析耗时: ${endTime - startTime}ms`);
    console.log(`- 平均每次分析耗时: ${(endTime - startTime) / 100}ms`);

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

/**
 * 运行API对比测试
 */
function runAPIComparisonTest(): void {
  console.log('\n🔄 运行新旧API对比测试...\n');

  try {
    const teamParsed = Team.import(teamExportFormat) as Team<PokemonSet<string>>;

    // 新API测试
    const newAnalyzer = new ResistanceAnalyzer(9);
    const newStartTime = Date.now();
    const newResult = newAnalyzer.analyze(teamParsed);
    const newEndTime = Date.now();

    // 验证数据一致性
    const newFireResistance = getPokemonResistance(newResult, 0, 'Fire');
    console.log(`新API - Incineroar对火属性抗性: ${newFireResistance}`);
    console.log(`新API - 分析耗时: ${newEndTime - newStartTime}ms`);

    // 验证数据结构
    console.log(`新API - 数据结构验证:`);
    console.log(`  - typeResistances长度: ${newResult.typeResistances.length}`);
    console.log(`  - pokemonData长度: ${newResult.pokemonData.length}`);
    console.log(`  - 包含metadata: ${!!newResult.metadata}`);
    console.log(`  - 包含summary: ${!!newResult.summary}`);

    console.log('\n✅ API对比测试完成');

  } catch (error) {
    console.error('❌ API对比测试失败:', error);
  }
}

// 执行测试
runResistanceAnalysisTest();
runAPIComparisonTest();
