# Pokémon Team Analysis - API Reference

This document provides comprehensive API documentation for the Pokémon Team Analysis library.

## 📁 Library Architecture

```
lib/
├── analyzer/           # Analysis engine modules
│   ├── shared/         # Shared base classes
│   │   └── baseAnalyzer.ts
│   ├── resistance/     # Type resistance analysis
│   │   └── resistanceAnalyzer.ts
│   └── coverage/       # Attack coverage analysis
│       └── coverageAnalyzer.ts
├── calculator/         # Calculation modules
│   └── statsCalculator.ts
├── core/              # Core infrastructure
│   ├── constants.ts    # System constants
│   ├── types.ts        # Type definitions
│   ├── utils.ts        # Utility functions
│   ├── cacheManager.ts # Cache management
│   ├── dataService.ts  # Data access service
│   └── formats/        # Format initialization
│       ├── formatInitializer.ts
│       └── customFormats.ts
├── parser/            # Team parsing module
│   └── teamParser.ts
├── data/              # Static data
│   └── pokemon-id-mapping.json
└── index.ts           # Main export entry
```

---

## 🏗️ Core Infrastructure (core/)

### `constants.ts` - System Constants
**Purpose**: Define system-level constants to avoid hardcoding

**Key Constants**:
- **Game Configuration**: `DEFAULT_GAME_VERSION = 'sv'`, `DEFAULT_GENERATION = 9`, `DEFAULT_LEVEL = 50`
- **Generation Mapping**: `GENERATION_MAP` - Maps supported game versions to generation numbers
- **Default Values**:
  - `DEFAULT_BASE_STATS` - Default base stats (all 100)
  - `DEFAULT_IVS` - Default individual values (all 31)
  - `DEFAULT_EVS` - Default effort values (all 0)
  - `DEFAULT_STATS` - Default final stats
- **Nature System**:
  - `NATURE_BOOST = 1.1`, `NATURE_REDUCTION = 0.9`, `NATURE_NEUTRAL = 1.0`
  - `NATURE_MODIFIERS` - Stat modifications for all 25 natures
- **Cache Configuration**:
  - `CACHE_TTL` - Cache duration for different data types (static 24h, long 1h, medium 30min, short 5min)
  - `CACHE_KEYS` - Cache key generators
  - `CACHE_MANAGER_CONFIG` - Cache manager configuration
  - `CACHE_HEALTH_THRESHOLDS` - Health monitoring thresholds

### `types.ts` - Type Definition System
**Purpose**: Define TypeScript types for the entire system

**Core Types**:
- **Basic Types**: `StatKey`, `NatureModifier`, `HealthStatus`
- **Pokémon Data**:
  - `Pokemon` - Extends `@pkmn/sets` `PokemonSet` with computed properties and analysis data
  - `NatureEffect` - Nature effect definitions
  - `PokemonSpeciesData`, `PokemonMoveData`, `PokemonAbilityData`, `PokemonItemData`
- **Analysis Related**:
  - `PokemonAnalysisData` - Pokémon data structure for analysis
  - `TeamAnalysisCache` - Team analysis cache structure
- **Validation Types**: `PokemonValidationError`, `TeamValidationResult`
- **Analysis Results**:
  - `ResistanceAnalysisResult` - Resistance analysis results
  - `CoverageAnalysisResult` - Coverage analysis results

### `utils.ts` - Utility Functions
**Purpose**: Provide internal utility functions for the library

**Key Functions**:
- `normalizeName(name: string)` - Normalize Pokémon names for ID mapping
  - Convert to lowercase
  - Standardize hyphen format
  - Remove special characters
  - Convert spaces to hyphens

### `cacheManager.ts` - Advanced Caching Engine
**Purpose**: Provide enterprise-grade caching functionality

**Core Features**:
- **LRU Eviction**: Least Recently Used memory management
- **TTL Expiration**: Automatic cleanup of expired data with periodic cleaning
- **Data Compression**: Automatic compression for large objects
- **Batch Operations**: `setBatch()`, `getBatch()`, `deleteBatch()`
- **Pattern Matching**: `getKeysByPattern()`, `clearByPattern()` - Regex-based operations
- **Cache Warming**: `warmup()` - Preload hot data
- **Health Monitoring**:
  - Cache hit rate and memory usage monitoring
  - `getStats()` - Get detailed statistics
  - `getHealthReport()` - Health status report

**Configuration**:
- `MAX_CACHE_SIZE: 1000` - Maximum cache entries
- `CLEANUP_INTERVAL: 5 minutes` - Cleanup interval
- `COMPRESSION_THRESHOLD: 1KB` - Compression threshold

### `dataService.ts` - Data Service Core
**Purpose**: Unified data access service for Pokémon data management

**Core Functions**:
- **Generation Management**:
  - `setGeneration(gen: number)` - Set current generation
  - `getGeneration(gen?: number)` - Get generation object with caching
- **Data Caching**: Uses `cacheManager` to cache `Generation` objects, avoiding repeated creation

**Caching Strategy**: Generation data is cached long-term (1 hour) as this data is relatively stable

### `formats/` - Format System

#### `customFormats.ts` - Custom Format Definitions
**Purpose**: Define Pokémon Showdown custom battle formats

**Supported Formats**:
- `doublesRegG` - Doubles Regulation G (one legendary allowed)
- `doublesRegH` - Doubles Regulation H (no legendaries)
- `doublesRegI` - Doubles Regulation I (two legendaries allowed)
- `singlesRegG` - Singles Regulation G
- `singlesRegH` - Singles Regulation H
- `singlesRegI` - Singles Regulation I

#### `formatInitializer.ts` - Format Initializer
**Purpose**: Safely initialize Pokémon Showdown battle formats

**Core Features**:
- **Idempotent Operations**: Uses global symbols to prevent duplicate initialization
- **Error Handling**: Safely handles initialization failures and duplicate ID errors
- **Verification**: `verifyFormatsLoaded()` - Verify formats are correctly loaded
- **Lazy Loading Handling**: Delayed verification to resolve Dex lazy loading issues

---

## 🧮 Calculator Module (calculator/)

### `statsCalculator.ts` - Stats Calculator
**Purpose**: Calculate Pokémon final stats

**Core Functions**:
- `calculateStats()` - Main calculation function with defensive programming
  - Parameter validation: Level range check (1-100)
  - Data normalization: Automatically handle `undefined` inputs
  - Error handling: Provide defaults and log warnings

**Helper Functions**:
- `safeGetStatValue()` - Safely get stat values
- `normalizeStatsTable()` - Normalize stats table
- `getNatureModifier()` - Get nature modifiers
- `calculateHP()` - HP special calculation formula
- `calculateStat()` - Other stats calculation formula

**Calculation Formulas**:
```
HP = floor((base * 2 + iv + ev/4) * level/100 + 10 + level)
Other = floor((base * 2 + iv + ev/4) * level/100 + 5) * nature_modifier
```

**Error Handling**: When `baseStats` is `undefined`, use defaults and log warnings

---

## 🔍 Parser Module (parser/)

### `teamParser.ts` - Team Parser
**Purpose**: Parse team strings into structured data

**Core Functions**:
- `parseAndValidateTeam()` - Main parsing function
  - Format initialization: Ensure custom formats are loaded
  - Team parsing: Use `@pkmn/sim`'s `Teams.import()`
  - Rule validation: Use `TeamValidator` to validate team compliance
  - Data completion: Add base stats, stats, move details, etc.

**Helper Functions**:
- `getIdMappingCache()` - Get PokeAPI ID mapping table (lazy loading)
- `getPokeApiNum()` - Get PokeAPI number
- `completeSinglePokemon()` - Complete single Pokémon information
- `completeTeam()` - Batch complete team information

**Workflow**:
1. Initialize formats (`initializeFormats()`)
2. Parse team string (`Teams.import()`)
3. Validate rule compliance (`TeamValidator`)
4. Batch get species data
5. Calculate final stats
6. Add move details and PokeAPI numbers

**Performance Optimizations**:
- Static data caching: ID mapping table lazy loading
- Batch processing: Get all species data at once
- Error recovery: Safely handle missing data

---

## 📊 Analyzer Module (analyzer/)

### `baseAnalyzer.ts` - Base Analyzer
**Purpose**: Shared base class for all analyzers

**Core Features**:
- Common analysis interfaces
- Shared utility methods
- Error handling patterns

### `resistanceAnalyzer.ts` - Resistance Analyzer
**Purpose**: Analyze team's defensive type resistances

**Key Methods**:
- `analyzeResistances(team: Pokemon[])` - Analyze team resistances
- `calculateTypeEffectiveness()` - Calculate type effectiveness
- `identifyWeaknesses()` - Identify defensive weaknesses

### `coverageAnalyzer.ts` - Coverage Analyzer
**Purpose**: Analyze team's offensive type coverage

**Key Methods**:
- `analyzeCoverage(team: Pokemon[])` - Analyze attack coverage
- `calculateOffensiveTypes()` - Calculate offensive type distribution
- `identifyGaps()` - Identify coverage gaps

---

## 🔧 Usage Examples

### Basic Team Analysis

```typescript
import { parseAndValidateTeam, analyzeResistances, analyzeCoverage } from '@/lib'

// Parse team from string
const teamData = `
Pikachu @ Light Ball
Ability: Static
Level: 50
EVs: 252 Atk / 4 SpA / 252 Spe
Jolly Nature
- Thunderbolt
- Quick Attack
- Iron Tail
- Volt Switch
`

try {
  // Parse and validate team
  const result = await parseAndValidateTeam(teamData, 'doublesRegG')

  if (result.isValid) {
    const team = result.team

    // Analyze resistances
    const resistanceAnalysis = await analyzeResistances(team)
    console.log('Weaknesses:', resistanceAnalysis.weaknesses)

    // Analyze coverage
    const coverageAnalysis = await analyzeCoverage(team)
    console.log('Coverage gaps:', coverageAnalysis.gaps)
  } else {
    console.error('Team validation errors:', result.errors)
  }
} catch (error) {
  console.error('Analysis failed:', error)
}
```

### Stats Calculation

```typescript
import { calculateStats } from '@/lib/calculator/statsCalculator'

const pokemon = {
  species: 'Pikachu',
  level: 50,
  nature: 'Jolly',
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }
}

const stats = calculateStats(pokemon)
console.log('Final stats:', stats)
```

### Cache Management

```typescript
import { cacheManager } from '@/lib/core/cacheManager'

// Set cache data
await cacheManager.set('team-analysis-123', analysisResult, 'medium')

// Get cache data
const cached = await cacheManager.get('team-analysis-123')

// Batch operations
await cacheManager.setBatch([
  ['key1', data1],
  ['key2', data2]
])

// Get cache statistics
const stats = cacheManager.getStats()
console.log('Cache hit rate:', stats.hitRate)
```

---

## 🚨 Error Handling

The library implements comprehensive error handling:

- **Validation Errors**: Team and Pokémon validation with detailed error messages
- **Data Errors**: Safe handling of missing or invalid data with fallbacks
- **Cache Errors**: Graceful degradation when cache operations fail
- **Network Errors**: Retry mechanisms for external data fetching

## 🔧 Configuration

### Environment Variables

```bash
# Cache configuration
CACHE_MAX_SIZE=1000
CACHE_TTL_STATIC=86400000  # 24 hours
CACHE_TTL_LONG=3600000     # 1 hour

# Data service configuration
DEFAULT_GENERATION=9
DEFAULT_LEVEL=50
```

### Runtime Configuration

```typescript
import { setCacheConfig, setDefaultGeneration } from '@/lib'

// Configure cache
setCacheConfig({
  maxSize: 2000,
  ttl: {
    static: 24 * 60 * 60 * 1000,  // 24 hours
    long: 60 * 60 * 1000          // 1 hour
  }
})

// Set default generation
setDefaultGeneration(9)
```
