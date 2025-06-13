# 宝可梦队伍抗性分析模块

这个模块提供了对宝可梦队伍进行属性抗性分析的功能，经过重构后具有更好的可维护性、可读性和模块化设计。

## 文件结构

```
lib/analyzer/
├── resistanceAnalysis.ts      # 主要分析函数
├── resistanceUtils.ts         # 工具函数和常量
├── resistanceAnalysis.test.ts # 测试文件
└── README.md                  # 说明文档
```

## 主要功能

### `resistanceAnalysis(team: Team, genNum: number): ResistanceReport`

分析宝可梦队伍对各属性攻击的抗性。

**参数：**
- `team`: 宝可梦队伍对象
- `genNum`: 世代编号（如第9世代传入9）

**返回值：**
- `ResistanceReport`: 包含每个属性类型对应的抗性倍率和宝可梦列表

## 重构改进

### 1. 模块化设计
- **主文件** (`resistanceAnalysis.ts`): 包含核心分析逻辑
- **工具文件** (`resistanceUtils.ts`): 包含可复用的常量和辅助函数
- **测试文件** (`resistanceAnalysis.test.ts`): 包含测试代码和示例

### 2. 代码可读性提升
- 添加了详细的JSDoc注释
- 使用了清晰的函数命名
- 逻辑分步骤进行，每步都有注释说明

### 3. 可维护性增强
- 提取了常量定义，便于修改和扩展
- 函数职责单一，便于测试和调试
- 使用TypeScript类型定义，提供更好的类型安全

### 4. 可复用性提升
- 提取了通用的工具函数
- 常量和配置集中管理
- 函数设计支持扩展新的特性和道具

## 支持的特性和道具

### 特性 (Abilities)
- **免疫特性**: Levitate, Volt Absorb, Motor Drive, Lightning Rod, Storm Drain, Water Absorb, Flash Fire, Well-Baked Body, Sap Sipper, Earth Eater
- **特殊效果特性**: Dry Skin

### 道具 (Items)
- **Air Balloon**: 地面属性免疫
- **Iron Ball**: 移除飞行属性和漂浮特性的地面免疫
- **Ring Target**: 移除属性免疫效果

## 使用示例

```typescript
import { Team } from '@pkmn/sets';
import { resistanceAnalysis } from './resistanceAnalysis';

// 导入队伍数据
const teamData = `
Incineroar @ Safety Goggles
Ability: Intimidate
...
`;

// 解析队伍
const team = Team.import(teamData);

// 执行抗性分析
const result = resistanceAnalysis(team, 9);

// 查看结果
console.log(result);
```

## 工具函数

`resistanceUtils.ts` 提供了以下工具函数：

- `getAbilityMultiplier()`: 计算特性对属性的倍率影响
- `getItemMultiplier()`: 计算道具对属性的倍率影响
- `hasType()`: 检查宝可梦是否具有指定属性
- `filterTypes()`: 过滤掉指定的属性类型
- `formatMultiplier()`: 格式化抗性倍率为可读字符串
- `getResistanceLevel()`: 获取抗性等级描述

## 测试

运行测试：

```bash
# 使用 Node.js 直接运行测试文件
node lib/analyzer/resistanceAnalysis.test.js

# 或使用 TypeScript 运行
ts-node lib/analyzer/resistanceAnalysis.test.ts
```

## 扩展指南

### 添加新特性
1. 在 `resistanceUtils.ts` 中的相应常量中添加特性定义
2. 如需特殊处理，在相应的处理函数中添加逻辑

### 添加新道具
1. 在 `ITEM_EFFECTS` 中添加道具定义
2. 如需特殊处理，创建专门的处理函数

### 添加新的分析维度
1. 扩展 `ResistanceReport` 接口
2. 在主分析函数中添加相应的计算逻辑

## 性能考虑

- 使用了常量查找而非复杂的条件判断
- 函数设计避免了重复计算
- 类型系统提供了编译时优化的可能性
