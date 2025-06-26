# Pokémon Team Analysis

[![Nuxt](https://img.shields.io/badge/Nuxt-3.17.5-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.10-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/i18n-5%20Languages-4F46E5)](https://i18n.nuxtjs.org/)

> A comprehensive Pokémon team analysis tool built with Nuxt 3, providing in-depth coverage and resistance analysis for competitive Pokémon battles.

## ✨ Features

### 🔍 **Team Analysis**
- **Coverage Analysis** - Analyze your team's offensive type coverage
- **Resistance Analysis** - Identify defensive weaknesses and strengths
- **Multi-format Support** - Supports various competitive formats (Regulation G/H/I)

### 🌍 **Internationalization**
- **5 Languages**: English, Japanese, Korean, Simplified Chinese, Traditional Chinese
- **SEO Optimized** - Proper hreflang and canonical URLs
- **Browser Detection** - Automatic language detection

### 🎨 **Modern UI/UX**
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Automatic theme switching
- **Accessibility** - WCAG compliant
- **Performance** - Optimized for speed and SEO

### ⚡ **Technical Features**
- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Deploy anywhere
- **PWA Ready** - Offline support capabilities
- **Analytics Ready** - Google Analytics 4 & AdSense integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pokemon-team-analysis.git
cd pokemon-team-analysis

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build for production
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[API Reference](./docs/API.md)** - Core library API documentation
- **[Style Guide](./docs/STYLE_GUIDE.md)** - UI components and styling conventions
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, workflow, and contribution guidelines
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[i18n Guide](./docs/I18N.md)** - Internationalization and localization

## 🏗️ Project Structure

```
pokemon-team-analysis/
├── assets/                    # Static assets (CSS, icons, images)
├── components/                # Vue components
│   ├── global/               # Auto-imported global components
│   ├── layout/               # Layout-specific components
│   └── ui/                   # Reusable UI components
├── composables/              # Vue composables (reusable logic)
├── data/                     # Static Pokémon data files
├── docs/                     # 📚 Project documentation
├── i18n/                     # Internationalization
│   └── locales/             # Translation files
├── lib/                      # Core analysis library
│   ├── analyzer/            # Analysis engines
│   ├── calculator/          # Stats calculations
│   ├── core/                # Core infrastructure
│   └── parser/              # Team parsing logic
├── pages/                    # Vue pages (auto-routed)
├── plugins/                  # Nuxt plugins
├── server/                   # Server-side API routes
├── types/                    # TypeScript type definitions
└── utils/                    # Utility functions
```

## 🧪 Testing & Validation

```bash
# Validate translation consistency
npm run validate:translations

# Type checking
npx nuxi typecheck
```

## 🌐 Supported Languages

| Language | Code | Status |
|----------|------|---------|
| English | `en` | ✅ Complete |
| 日本語 | `ja` | 🔄 Needs Improvement |
| 한국어 | `ko` | 🔄 Needs Improvement |
| 简体中文 | `zh-hans` | ✅ Complete |
| 繁體中文 | `zh-hant` | ✅ Complete |

> 💡 **Want to help improve translations?** We welcome native speakers to help improve our Japanese and Korean translations. Please contact us through [GitHub Issues](https://github.com/your-username/pokemon-team-analysis/issues) or check our [i18n Guide](./docs/I18N.md) for contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Smogon](https://www.smogon.com/) - Competitive Pokémon data and formats
- [@pkmn](https://github.com/pkmn) - Pokémon data libraries and tools
- [PokéAPI](https://pokeapi.co/) - Pokémon data API

---

<div align="center">
  <p>Built with ❤️ for the Pokémon competitive community</p>
</div>
