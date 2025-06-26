# Pokemon Team Analysis - Development Guide

This guide covers everything you need to know to contribute to the Pokemon Team Analysis project.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm equivalent)
- **Git**: Latest version
- **VS Code**: Recommended IDE

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pokemon-team-analysis.git
   cd pokemon-team-analysis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables** (optional)
   ```bash
   # Create .env file for optional services
   NUXT_PUBLIC_GA4_ID=your-ga4-id
   NUXT_PUBLIC_ADSENSE_CLIENT=your-adsense-client
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### VS Code Setup

**Recommended Extensions**:
```json
{
  "recommendations": [
    "Vue.volar",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "lokalise.i18n-ally"
  ]
}
```

**Workspace Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "i18n-ally.localesPaths": ["i18n/locales"],
  "i18n-ally.keystyle": "nested"
}
```

## 📁 Project Structure

```
pokemon-team-analysis/
├── assets/                    # Static assets
│   ├── css/                  # Global styles
│   └── icons/                # Icon files
├── components/               # Vue components
│   ├── global/              # Auto-imported components
│   ├── layout/              # Layout components
│   └── ui/                  # Reusable UI components
├── composables/             # Vue composables
├── data/                    # Static Pokemon data
├── docs/                    # 📚 Documentation
├── i18n/                    # Internationalization
│   └── locales/            # Translation files
├── lib/                     # Core analysis library
│   ├── analyzer/           # Analysis engines
│   ├── calculator/         # Calculations
│   ├── core/               # Core infrastructure
│   └── parser/             # Team parsing
├── pages/                   # File-based routing
├── plugins/                 # Nuxt plugins
├── server/                  # Server-side code
├── types/                   # Global type definitions
└── utils/                   # Utility functions
```

## 🎨 Coding Standards

### Naming Conventions

Following the project's established naming conventions:

#### **Files & Directories**
- Use `kebab-case` for all files and directories
- Examples: `pokemon-card.vue`, `team-analysis.ts`, `user-preferences.json`

#### **Variables & Functions (JS/TS)**
- Use `camelCase` for variables and functions
- Examples: `currentLocale`, `getUserRegion()`, `teamAnalysisData`

#### **Vue Components**
- File names: `kebab-case` (e.g., `pokemon-card.vue`)
- Component names in templates: `PascalCase` (e.g., `<PokemonCard />`)

#### **JSON Files**
- Use `kebab-case` for consistency
- Examples: `zh-hans.json`, `en.json`

### Code Style

#### **Indentation**
- Always use **2 spaces** (no tabs)
- Configure your editor to show whitespace

#### **TypeScript**
- Use strict TypeScript configuration
- Prefer interfaces over types for object definitions
- Use proper type annotations

```typescript
// ✅ Good
interface PokemonData {
  name: string;
  level: number;
  types: string[];
}

const analyzePokemon = (pokemon: PokemonData): AnalysisResult => {
  // implementation
}

// ❌ Avoid
const analyzePokemon = (pokemon: any) => {
  // implementation
}
```

#### **Vue Components**
- Use Composition API
- Use `<script setup>` syntax
- Proper prop definitions with TypeScript

```vue
<script setup lang="ts">
interface Props {
  pokemon: Pokemon;
  showStats?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showStats: true
});

const emit = defineEmits<{
  select: [pokemon: Pokemon];
}>();
</script>
```

#### **CSS/Tailwind**
- Prefer Tailwind utility classes
- Use component classes for repeated patterns
- Follow mobile-first responsive design

```vue
<template>
  <!-- ✅ Good -->
  <div class="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
      {{ title }}
    </h2>
  </div>
</template>
```

## 🧪 Testing

### Running Tests

```bash
# Type checking
npx nuxi typecheck

# Translation validation
npm run validate:translations

# Lint checking
npm run lint

# Format checking
npm run format:check
```

### Writing Tests

#### **Unit Tests** (Future)
```typescript
// tests/unit/calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateStats } from '@/lib/calculator/statsCalculator'

describe('statsCalculator', () => {
  it('should calculate correct HP', () => {
    const result = calculateStats({
      species: 'Pikachu',
      level: 50,
      // ... other props
    })

    expect(result.hp).toBe(expectedValue)
  })
})
```

#### **Component Tests** (Future)
```typescript
// tests/components/PokemonCard.test.ts
import { mount } from '@vue/test-utils'
import PokemonCard from '@/components/ui/PokemonCard.vue'

describe('PokemonCard', () => {
  it('renders pokemon name correctly', () => {
    const wrapper = mount(PokemonCard, {
      props: {
        pokemon: mockPokemon
      }
    })

    expect(wrapper.text()).toContain('Pikachu')
  })
})
```

## 🌍 Internationalization

### Adding New Translations

1. **Update all locale files**
   ```bash
   # Add the same key to all files
   i18n/locales/en.json
   i18n/locales/ja.json
   i18n/locales/ko.json
   i18n/locales/zh-hans.json
   i18n/locales/zh-hant.json
   ```

2. **Validate translations**
   ```bash
   npm run validate:translations
   ```

3. **Use in components**
   ```vue
   <template>
     <p>{{ $t('your.new.key') }}</p>
   </template>
   ```

### Translation Guidelines

- **Keys**: Use nested dot notation (`section.subsection.key`)
- **Values**: Keep translations concise and clear
- **Placeholders**: Use `{variable}` for dynamic content
- **Pluralization**: Use i18n pluralization rules

```json
{
  "team": {
    "analysis": {
      "title": "Team Analysis",
      "pokemon_count": "No pokemon | {count} pokemon | {count} pokemon"
    }
  }
}
```

### Adding New Languages

1. **Create locale file**
   ```bash
   touch i18n/locales/new-lang.json
   ```

2. **Update Nuxt config**
   ```typescript
   // nuxt.config.ts
   i18n: {
     locales: [
       // existing locales...
       {
         code: 'new-lang',
         iso: 'new-Lang',
         name: 'New Language',
         file: 'new-lang.json'
       }
     ]
   }
   ```

3. **Add all translations**
4. **Test thoroughly**

## 🔧 Development Workflow

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build process or auxiliary tool changes

Examples:
```bash
feat: add resistance analysis for team
fix: correct type effectiveness calculation
docs: update API documentation
style: format code with prettier
refactor: extract common utility functions
```

### Pull Request Guidelines

1. **Clear title and description**
2. **Link related issues**
3. **Include screenshots for UI changes**
4. **Ensure all checks pass**
5. **Request appropriate reviewers**

**PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Translation validation passed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🏗️ Adding New Features

### 1. Analysis Features

When adding new analysis capabilities:

1. **Create analyzer class**
   ```typescript
   // lib/analyzer/new-analyzer.ts
   import { BaseAnalyzer } from './base-analyzer'

   export class NewAnalyzer extends BaseAnalyzer {
     analyze(team: Pokemon[]): NewAnalysisResult {
       // implementation
     }
   }
   ```

2. **Add types**
   ```typescript
   // lib/core/types.ts
   export interface NewAnalysisResult {
     // result structure
   }
   ```

3. **Export from index**
   ```typescript
   // lib/index.ts
   export { NewAnalyzer } from './analyzer/new-analyzer'
   ```

4. **Create UI component**
   ```vue
   <!-- components/ui/NewAnalysisDisplay.vue -->
   <template>
     <!-- UI implementation -->
   </template>
   ```

### 2. UI Components

When creating new UI components:

1. **Follow component structure**
   ```vue
   <script setup lang="ts">
   // Props, emits, composables
   </script>

   <template>
     <!-- Template with proper accessibility -->
   </template>

   <style scoped>
   /* Component-specific styles if needed */
   </style>
   ```

2. **Add to appropriate directory**
   - `components/ui/` - Reusable UI components
   - `components/layout/` - Layout-specific components
   - `components/global/` - Auto-imported global components

3. **Document component**
   ```typescript
   /**
    * NewComponent - Description of what this component does
    *
    * @example
    * <NewComponent :prop="value" @event="handler" />
    */
   ```

### 3. Pages and Routes

1. **Create page file**
   ```vue
   <!-- pages/new-page.vue -->
   <script setup lang="ts">
   // Page logic
   useSeoMeta({
     title: 'Page Title',
     description: 'Page description'
   })
   </script>

   <template>
     <PageContainer>
       <!-- Page content -->
     </PageContainer>
   </template>
   ```

2. **Add translations**
   ```json
   {
     "pages": {
       "newPage": {
         "title": "New Page",
         "description": "Description"
       }
     }
   }
   ```

3. **Update navigation** (if needed)
   ```vue
   <!-- components/layout/Header.vue -->
   <NuxtLink :to="localePath('/new-page')">
     {{ $t('pages.newPage.title') }}
   </NuxtLink>
   ```

## 🐛 Debugging

### Common Issues

1. **Hydration Mismatches**
   - Use `<ClientOnly>` for client-side only components
   - Ensure server and client render the same content

2. **Translation Issues**
   - Run `npm run validate:translations`
   - Check for missing keys in all locales

3. **Type Errors**
   - Run `npx nuxi typecheck`
   - Ensure proper type imports

4. **Cache Issues**
   - Clear `.nuxt` directory: `rm -rf .nuxt`
   - Restart development server

### Debugging Tools

1. **Vue DevTools**
   - Install browser extension
   - Inspect component state and props

2. **Nuxt DevTools**
   - Built-in development tools
   - Access at `http://localhost:3000/_nuxt/`

3. **Console Debugging**
   ```typescript
   // Add debug logs
   console.log('Debug:', { variable })

   // Use debugger statement
   debugger;
   ```

## 📦 Build and Deployment

### Development Build
```bash
npm run build
npm run preview
```

### Static Generation
```bash
npm run generate
```

### Environment-specific Builds
```bash
# Production build
NODE_ENV=production npm run build

# Staging build
NODE_ENV=staging npm run build
```

## 🤝 Contributing

### Before Contributing

1. **Check existing issues** - Look for related issues or discussions
2. **Create an issue** - Describe the feature or bug
3. **Get approval** - Wait for maintainer feedback
4. **Follow guidelines** - Use this development guide

### Contribution Types

- **Bug fixes** - Always welcome
- **New features** - Discuss first in issues
- **Documentation** - Improvements always appreciated
- **Translations** - Help expand language support
- **Performance** - Optimizations and improvements

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and general discussion
- **Code Review** - Learn from PR feedback

Remember: Every contribution, no matter how small, is valuable and appreciated! 🙏
