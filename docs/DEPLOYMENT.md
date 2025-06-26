# Pokemon Team Analysis - Deployment Guide

This guide covers deploying the Pokemon Team Analysis application to various platforms and environments.

## 🚀 Deployment Options

### Static Site Generation (Recommended)

The application is designed for static site generation, making it deployable to any CDN or static hosting service.

```bash
# Generate static site
npm run generate

# Output will be in .output/public/
```

### Server-Side Rendering

For dynamic features or server-side functionality:

```bash
# Build for SSR
npm run build

# Start production server
npm run preview
```

## 🌐 Platform-Specific Deployments

### Vercel (Recommended)

**Automatic Deployment**:
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Nuxt 3 and configure build settings
3. Set environment variables in Vercel dashboard

**Manual Deployment**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**vercel.json** (optional):
```json
{
  "builds": [
    {
      "src": "nuxt.config.ts",
      "use": "@nuxtjs/vercel-builder"
    }
  ]
}
```

### Netlify

**Automatic Deployment**:
1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `npm run generate`
   - Publish directory: `.output/public`

**netlify.toml**:
```toml
[build]
  command = "npm run generate"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### GitHub Pages

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate static site
        run: npm run generate
        env:
          NUXT_PUBLIC_GA4_ID: ${{ secrets.GA4_ID }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./.output/public
```

### AWS S3 + CloudFront

**Build and Deploy Script**:
```bash
#!/bin/bash
# deploy-aws.sh

# Generate static site
npm run generate

# Sync to S3
aws s3 sync .output/public/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

**S3 Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "preview"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  pokemon-analysis:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_GA4_ID=${GA4_ID}
    restart: unless-stopped
```

**Build and Deploy**:
```bash
# Build image
docker build -t pokemon-team-analysis .

# Run container
docker run -p 3000:3000 pokemon-team-analysis

# Using docker-compose
docker-compose up -d
```

## ⚙️ Environment Configuration

### Environment Variables

Create environment-specific configuration:

**Production (.env.production)**:
```bash
NUXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NUXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxx
NODE_ENV=production
```

**Staging (.env.staging)**:
```bash
NUXT_PUBLIC_GA4_ID=G-STAGING-ID
NODE_ENV=staging
```

### Runtime Configuration

**nuxt.config.ts**:
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://pokemonteamanalysis.com',
      ga4Id: process.env.NUXT_PUBLIC_GA4_ID || '',
      adsenseClient: process.env.NUXT_PUBLIC_ADSENSE_CLIENT || '',
      environment: process.env.NODE_ENV || 'development'
    }
  }
})
```

## 🔧 Build Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Or using nuxi
npx nuxi analyze
```

### Performance Optimization

**nuxt.config.ts optimizations**:
```typescript
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,
    minify: true
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            pokemon: ['@pkmn/data', '@pkmn/dex', '@pkmn/sets', '@pkmn/sim'],
            ui: ['lucide-vue-next']
          }
        }
      }
    }
  },

  image: {
    quality: 80,
    format: ['webp', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  }
})
```

## 🔒 Security Configuration

### Security Headers

**nuxt.config.ts**:
```typescript
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      }
    }
  }
})
```

### Content Security Policy

```typescript
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self' https://www.google-analytics.com"
          ].join('; ')
        }
      }
    }
  }
})
```

## 📊 Monitoring & Analytics

### Performance Monitoring

**Web Vitals Tracking**:
```typescript
// plugins/performance.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }
})
```

### Error Tracking

**Error Boundary**:
```vue
<!-- plugins/error-tracking.client.ts -->
export default defineNuxtPlugin(() => {
  window.addEventListener('error', (event) => {
    // Log error to monitoring service
    console.error('Global error:', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    // Log unhandled promise rejection
    console.error('Unhandled rejection:', event.reason)
  })
})
```

## 🚦 CI/CD Pipeline

### GitHub Actions

**Complete CI/CD Pipeline** (`.github/workflows/ci-cd.yml`):
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx nuxi typecheck

      - name: Validate translations
        run: npm run validate:translations

      - name: Build
        run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate static site
        run: npm run generate
        env:
          NODE_ENV: staging

      - name: Deploy to Staging
        # Deploy to staging environment

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate static site
        run: npm run generate
        env:
          NODE_ENV: production
          NUXT_PUBLIC_GA4_ID: ${{ secrets.GA4_ID }}
          NUXT_PUBLIC_ADSENSE_CLIENT: ${{ secrets.ADSENSE_CLIENT }}

      - name: Deploy to Production
        # Deploy to production environment
```

## 🔍 Health Checks

### Application Health Check

**server/api/health.get.ts**:
```typescript
export default defineEventHandler(async (event) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  }

  return health
})
```

### Monitoring Script

```bash
#!/bin/bash
# health-check.sh

URL="https://your-domain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
  echo "✅ Application is healthy"
  exit 0
else
  echo "❌ Application health check failed (HTTP $RESPONSE)"
  exit 1
fi
```

## 🔄 Rollback Strategy

### Quick Rollback

**Vercel**:
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

**AWS S3**:
```bash
# Restore from backup
aws s3 sync s3://backup-bucket/ s3://production-bucket/ --delete
```

### Blue-Green Deployment

```bash
#!/bin/bash
# blue-green-deploy.sh

# Deploy to staging environment
deploy_to_staging() {
  # Deployment logic
}

# Run health checks
health_check() {
  # Health check logic
}

# Switch traffic
switch_traffic() {
  # Traffic switching logic
}

# Main deployment flow
deploy_to_staging
if health_check; then
  switch_traffic
  echo "✅ Deployment successful"
else
  echo "❌ Health check failed, rolling back"
  exit 1
fi
```

## 📈 Performance Optimization

### CDN Configuration

**CloudFlare Settings**:
- Enable Brotli compression
- Set appropriate cache rules
- Enable HTTP/2 and HTTP/3
- Configure security settings

**Cache Headers**:
```typescript
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/': { prerender: true },
      '/about': { prerender: true },
      '/api/**': { cors: true },
      '/_nuxt/**': { headers: { 'cache-control': 's-maxage=31536000' } },
      '/images/**': { headers: { 'cache-control': 's-maxage=31536000' } }
    }
  }
})
```

### Database Optimization (if needed)

For future database requirements:

```typescript
// Database connection pooling
export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}
```

This deployment guide provides comprehensive coverage for deploying the Pokemon Team Analysis application across various platforms and environments. Choose the deployment method that best fits your infrastructure and requirements.
