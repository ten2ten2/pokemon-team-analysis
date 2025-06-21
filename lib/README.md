# Pokemon Team Analysis - Lib 架构文档

## 📁 目录结构概览

```
lib/
├── analyzer/           # 分析器模块
│   ├── shared/         # 共享基础类
│   │   └── baseAnalyzer.ts
│   ├── resistance/     # 属性抗性分析
│   │   └── resistanceAnalyzer.ts
│   └── coverage/       # 打击面覆盖分析
│       └── coverageAnalyzer.ts
├── calculator/         # 计算器模块
│   └── statsCalculator.ts
├── core/              # 核心基础设施
│   ├── constants.ts    # 系统常量
│   ├── types.ts        # 类型定义
│   ├── utils.ts        # 工具函数
│   ├── cacheManager.ts # 缓存管理器
│   ├── dataService.ts  # 数据服务
│   └── formats/        # 格式初始化
│       ├── formatInitializer.ts
│       └── customFormats.ts
├── parser/            # 队伍解析模块
│   └── teamParser.ts
├── data/              # 静态数据
│   └── pokemon-id-mapping.json
└── index.ts           # 统一导出入口
```

---

## 🏗️ 核心基础设施 (core/)

### `constants.ts` - 系统常量
**作用**: 定义系统级常量，避免硬编码

**主要常量**:
- **游戏配置**: `DEFAULT_GAME_VERSION = 'sv'`, `DEFAULT_GENERATION = 9`, `DEFAULT_LEVEL = 50`
- **世代映射**: `GENERATION_MAP` - 支持的游戏版本到世代号的映射
- **默认数值**:
  - `DEFAULT_BASE_STATS` - 默认种族值 (全100)
  - `DEFAULT_IVS` - 默认个体值 (全31)
  - `DEFAULT_EVS` - 默认努力值 (全0)
  - `DEFAULT_STATS` - 默认最终属性值
- **性格系统**:
  - `NATURE_BOOST = 1.1`, `NATURE_REDUCTION = 0.9`, `NATURE_NEUTRAL = 1.0`
  - `NATURE_MODIFIERS` - 25种性格的属性修正映射
- **缓存配置**:
  - `CACHE_TTL` - 不同类型数据的缓存时间 (静态24h, 长期1h, 中期30min, 短期5min)
  - `CACHE_KEYS` - 缓存键生成器
  - `CACHE_MANAGER_CONFIG` - 缓存管理器配置
  - `CACHE_HEALTH_THRESHOLDS` - 健康监控阈值

### `types.ts` - 类型定义系统
**作用**: 定义整个系统的 TypeScript 类型

**核心类型**:
- **基础类型**: `StatKey`, `NatureModifier`, `HealthStatus`
- **Pokemon 数据**:
  - `Pokemon` - 扩展了 `@pkmn/sets` 的 `PokemonSet`，增加了计算属性和分析数据
  - `NatureEffect` - 性格效果定义
  - `PokemonSpeciesData`, `PokemonMoveData`, `PokemonAbilityData`, `PokemonItemData`
- **分析相关**:
  - `PokemonAnalysisData` - 用于分析的 Pokemon 数据结构
  - `TeamAnalysisCache` - 队伍分析缓存结构
- **验证类型**: `PokemonValidationError`, `TeamValidationResult`
- **分析结果**:
  - `ResistanceAnalysisResult` - 抗性分析结果
  - `CoverageAnalysisResult` - 覆盖分析结果

### `utils.ts` - 工具函数
**作用**: 提供 lib 内部使用的工具函数

**主要函数**:
- `normalizeName(name: string)` - 标准化 Pokemon 名称，用于 ID 映射
  - 转换为小写
  - 统一连字符格式
  - 移除特殊字符
  - 空格转连字符

### `cacheManager.ts` - 高级缓存引擎
**作用**: 提供企业级的缓存功能

**核心特性**:
- **LRU 驱逐**: 最近最少使用的内存管理
- **TTL 过期**: 自动清理过期数据，支持定期清理
- **数据压缩**: 大对象自动压缩存储
- **批量操作**: `setBatch()`, `getBatch()`, `deleteBatch()`
- **模式匹配**: `getKeysByPattern()`, `clearByPattern()` - 按正则表达式操作
- **缓存预热**: `warmup()` - 预加载热点数据
- **健康监控**:
  - 缓存命中率、内存使用监控
  - `getStats()` - 获取详细统计信息
  - `getHealthReport()` - 健康状态报告

**配置项**:
- `MAX_CACHE_SIZE: 1000` - 最大缓存条目数
- `CLEANUP_INTERVAL: 5分钟` - 清理间隔
- `COMPRESSION_THRESHOLD: 1KB` - 压缩阈值

### `dataService.ts` - 数据服务核心
**作用**: 统一的数据访问服务，管理 Pokemon 数据

**核心功能**:
- **世代管理**:
  - `setGeneration(gen: number)` - 设置当前世代
  - `getGeneration(gen?: number)` - 获取世代对象，支持缓存
- **数据缓存**: 使用 `cacheManager` 缓存 `Generation` 对象，避免重复创建

**缓存策略**: 世代数据长期缓存 (1小时)，因为这些数据相对稳定

### `formats/` - 格式系统

#### `customFormats.ts` - 自定义格式定义
**作用**: 定义 Pokemon Showdown 的自定义对战格式

**支持格式**:
- `doublesRegG` - 双打 Regulation G (限制一只传说)
- `doublesRegH` - 双打 Regulation H (禁用传说)
- `doublesRegI` - 双打 Regulation I (限制两只传说)
- `singlesRegG` - 单打 Regulation G
- `singlesRegH` - 单打 Regulation H
- `singlesRegI` - 单打 Regulation I

#### `formatInitializer.ts` - 格式初始化器
**作用**: 安全地初始化 Pokemon Showdown 的对战格式

**核心特性**:
- **幂等操作**: 使用全局符号防止重复初始化
- **错误处理**: 安全处理初始化失败和重复 ID 错误
- **验证机制**: `verifyFormatsLoaded()` - 验证格式是否正确加载
- **惰性加载处理**: 延迟验证解决 Dex 惰性加载问题

---

## 🧮 计算器模块 (calculator/)

### `statsCalculator.ts` - 属性值计算器
**作用**: 计算宝可梦的最终属性值

**核心函数**:
- `calculateStats()` - 主要计算函数，支持防御性编程
  - 参数验证: 等级范围检查 (1-100)
  - 数据标准化: 自动处理 `undefined` 输入
  - 错误处理: 提供默认值，记录警告日志

**辅助函数**:
- `safeGetStatValue()` - 安全获取属性值
- `normalizeStatsTable()` - 标准化属性表
- `getNatureModifier()` - 获取性格修正
- `calculateHP()` - HP 特殊计算公式
- `calculateStat()` - 其他属性计算公式

**计算公式**:
```
HP = floor((种族值 * 2 + 个体值 + 努力值/4) * 等级/100 + 10 + 等级)
其他 = floor((种族值 * 2 + 个体值 + 努力值/4) * 等级/100 + 5) * 性格修正
```

**错误处理**: 当 `baseStats` 为 `undefined` 时，使用默认值并记录警告

---

## 🔍 解析器模块 (parser/)

### `teamParser.ts` - 队伍解析器
**作用**: 将队伍字符串解析为结构化数据

**核心函数**:
- `parseAndValidateTeam()` - 主要解析函数
  - 格式初始化: 确保自定义格式已加载
  - 队伍解析: 使用 `@pkmn/sim` 的 `Teams.import()`
  - 规则验证: 使用 `TeamValidator` 验证队伍合规性
  - 数据补全: 补充种族值、属性、招式详情等

**辅助函数**:
- `getIdMappingCache()` - 获取 PokeAPI ID 映射表 (懒加载)
- `getPokeApiNum()` - 获取 PokeAPI 编号
- `completeSinglePokemon()` - 补充单个宝可梦信息
- `completeTeam()` - 批量补充队伍信息

**工作流程**:
1. 初始化格式 (`initializeFormats()`)
2. 解析队伍字符串 (`Teams.import()`)
3. 验证规则合规性 (`TeamValidator`)
4. 批量获取种族数据
5. 计算最终属性值
6. 补充招式详情和 PokeAPI 编号

**性能优化**:
- 静态数据缓存: ID 映射表懒加载
- 批量处理: 一次性获取所有物种数据
- 错误恢复: 安全处理数据缺失

---

## 📊 分析器模块 (analyzer/)

### `shared/baseAnalyzer.ts` - 分析器基类
**作用**: 所有分析器的抽象基类

**抽象方法**:
- `analyze(team: Pokemon[], options?: TOptions): TResult` - 执行分析
- `getAnalysisType(): string` - 获取分析类型名称

**核心方法**:
- `analyzeWithCache()` - 带缓存的分析方法
  - 自动生成缓存键
  - 尝试从缓存获取结果
  - 缓存未命中时执行分析
  - 缓存分析结果

**工具方法**:
- `getTypeEffectiveness()` - 获取属性相性 (带缓存)
- `getAllTypes()` - 获取所有属性列表 (带缓存)
- `getCacheKey()` - 生成缓存键
- `getCachedResult()` / `setCachedResult()` - 缓存操作

**缓存策略**: 属性相性等静态数据长期缓存 (24小时)

### `resistance/resistanceAnalyzer.ts` - 抗性分析器
**作用**: 分析队伍的属性抗性分布

**分析选项** (`ResistanceAnalysisOptions`):
- `weather?: string` - 天气效果
- `terrain?: string` - 场地效果
- `terastallization?` - 太晶化设置

**当前状态**: 占位实现，返回空结果结构

### `coverage/coverageAnalyzer.ts` - 覆盖分析器
**作用**: 分析队伍的打击面覆盖

**分析选项** (`CoverageAnalysisOptions`):
- `includeHiddenPower?: boolean` - 是否包含觉醒力量
- `includeZMoves?: boolean` - 是否包含 Z 招式
- `includeDynamax?: boolean` - 是否包含极巨化

**当前状态**: 占位实现，返回空结果结构

---

## 📂 数据模块 (data/)

### `pokemon-id-mapping.json` - PokeAPI ID 映射
**作用**: 将标准化的 Pokemon 名称映射到 PokeAPI 编号

**数据格式**:
```json
{
  "bulbasaur": 1,
  "ivysaur": 2,
  "nidoran-f": 29,
  "nidoran-m": 32,
  "mr-mime": 122,
  ...
}
```

**使用场景**:
- 获取 Pokemon 的 PokeAPI 编号用于图片 URL
- 标准化名称处理 (连字符、大小写等)

---

## 📦 导出系统 (index.ts)

### 统一导出入口
**作用**: 提供整个 lib 的统一导出接口

**导出分类**:
- **核心模块**: `constants`, `dataService`, `cacheManager`
- **计算器**: `calculateStats` 及相关函数
- **解析器**: `parseAndValidateTeam`, `initializeFormats`
- **分析器**: `BaseAnalyzer`, `resistanceAnalyzer`, `coverageAnalyzer`
- **类型定义**: 分析选项类型等

---

## 🔄 系统工作流程

### 1. 队伍导入流程
```
用户输入队伍字符串
    ↓
initializeFormats() - 初始化自定义格式 (幂等)
    ↓
Teams.import() - 解析队伍字符串
    ↓
TeamValidator.validateTeam() - 验证规则合规性
    ↓
dataService.getGeneration() - 获取世代数据 (缓存)
    ↓
批量获取物种数据 - gen.species.get()
    ↓
calculateStats() - 计算属性值 (防御性编程)
    ↓
补充招式详情和 PokeAPI 编号
    ↓
返回完整的 Pokemon[] 数组
```

### 2. 分析执行流程
```
analyzer.analyzeWithCache()
    ↓
生成缓存键 - getCacheKey()
    ↓
检查缓存 - cacheManager.get()
    ↓ (缓存未命中)
执行分析 - analyzer.analyze()
    ↓
使用 dataService 获取数据
    ↓
使用工具方法获取属性相性等
    ↓
缓存结果 - cacheManager.set()
    ↓
返回分析结果
```

### 3. 缓存管理流程
```
数据请求
    ↓
cacheManager.get() - 检查缓存
    ↓
命中 → 更新访问统计 → 返回数据
    ↓
未命中 → 执行计算 → 缓存结果 → 返回数据
    ↓
定期清理 - cleanupExpired() (5分钟间隔)
    ↓
LRU 驱逐 - evictLRU() (容量达到上限时)
```

---

## 🎯 设计原则

### 1. 单一职责
- 每个模块只负责一个特定的功能领域
- 明确的接口边界，避免功能重叠

### 2. 防御性编程
- 全面的参数验证和错误处理
- 提供默认值，避免系统崩溃
- 详细的错误日志和警告信息

### 3. 缓存优先
- 智能缓存策略，平衡内存和性能
- 分层缓存: 静态数据长期缓存，动态数据短期缓存
- 缓存健康监控和自动清理

### 4. 类型安全
- 完整的 TypeScript 类型定义
- 编译时类型检查，减少运行时错误
- 泛型支持，提高代码复用性

### 5. 可扩展性
- 插件化的分析器架构 (`BaseAnalyzer`)
- 统一的接口，便于添加新功能
- 配置驱动，支持自定义格式和规则

---

## 🚀 使用示例

```typescript
import {
  parseAndValidateTeam,
  resistanceAnalyzer,
  cacheManager,
  calculateStats
} from './lib'

// 1. 解析队伍
const { teamParsed, errors } = parseAndValidateTeam(
  teamString,
  'doublesRegG',  // 使用自定义格式
  9
)

if (errors.length > 0) {
  console.warn('队伍验证警告:', errors)
}

// 2. 执行分析 (带缓存)
const resistanceResult = resistanceAnalyzer.analyzeWithCache(
  teamParsed,
  'team_id_123',
  {
    weather: 'sun',
    terastallization: { pokemonIndex: 0, teraType: 'Fire' }
  },
  30 * 60 * 1000  // 30分钟 TTL
)

// 3. 手动计算属性值
const stats = calculateStats(
  { hp: 100, atk: 120, def: 80, spa: 60, spd: 80, spe: 95 },
  { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
  { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
  50,
  'Adamant'
)

// 4. 查看缓存状态
const cacheStats = cacheManager.getStats()
console.log(`缓存命中率: ${cacheStats.hitRate}%`)
console.log(`内存使用: ${cacheStats.memoryUsage}`)

// 5. 缓存健康检查
const healthReport = cacheManager.getHealthReport()
if (healthReport.status !== 'healthy') {
  console.warn('缓存健康警告:', healthReport.recommendations)
}
```

---

## 📈 性能特性

### 缓存优化
- **LRU 驱逐**: 最近最少使用的内存管理，防止内存泄漏
- **TTL 过期**: 自动清理过期数据，保持数据新鲜度
- **数据压缩**: 大对象自动压缩，节省内存空间
- **批量操作**: 减少缓存操作的开销

### 计算优化
- **防御性编程**: 避免因数据缺失导致的计算失败
- **静态数据缓存**: 属性相性等不变数据长期缓存
- **懒加载**: ID 映射表等大数据按需加载

### 解析优化
- **批量处理**: 一次性获取所有物种数据，减少查询次数
- **格式缓存**: 自定义格式初始化结果缓存
- **错误恢复**: 单个 Pokemon 解析失败不影响整个队伍

### 监控能力
- **缓存统计**: 命中率、内存使用、访问次数等详细指标
- **健康检查**: 自动监控系统健康状态，提供优化建议
- **性能日志**: 详细的错误和警告日志，便于调试

---

## 🔧 配置说明

### 缓存配置
```typescript
// 缓存时间配置
CACHE_TTL = {
  STATIC: 24 * 60 * 60 * 1000,    // 静态数据 24小时
  LONG: 60 * 60 * 1000,           // 长期缓存 1小时
  MEDIUM: 30 * 60 * 1000,         // 中期缓存 30分钟
  SHORT: 5 * 60 * 1000,           // 短期缓存 5分钟
  SESSION: 2 * 60 * 60 * 1000     // 会话缓存 2小时
}

// 缓存管理器配置
CACHE_MANAGER_CONFIG = {
  MAX_CACHE_SIZE: 1000,           // 最大缓存条目数
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 清理间隔 5分钟
  COMPRESSION_THRESHOLD: 1024      // 压缩阈值 1KB
}
```

### 健康监控配置
```typescript
CACHE_HEALTH_THRESHOLDS = {
  HIT_RATE_WARNING: 50,      // 命中率低于50%时警告
  MEMORY_CRITICAL: 50000     // 内存使用超过50MB时严重警告
}
```

这个架构提供了高性能、可扩展、易维护的 Pokemon 队伍分析基础设施，具备完善的错误处理、缓存管理和性能监控能力。
