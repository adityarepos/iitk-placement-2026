# IITK Placement 2026

> Student placement statistics and company proformas for IIT Kanpur 2026 placement season.

## 🚀 Live Demo

**Visit:** [https://spontaneous-pudding-5a399a.netlify.app/](https://spontaneous-pudding-5a399a.netlify.app/)

## ✨ Features

- **📊 Stats Dashboard** - Browse student placement data with advanced search and filtering
- **🏢 Company Proformas** - Detailed job descriptions, eligibility criteria, and compensation packages
- **📅 Timeline Events** - Company-specific notices and updates
- **🎨 Dark Mode** - Seamless dark/light theme switching with smooth transitions (default: light)
- **📱 Mobile Responsive** - Optimized for all screen sizes with touch-friendly interactions
- **⚡ Lightning Fast** - Lazy loading, pre-compression, and intelligent caching (see [PERFORMANCE.md](PERFORMANCE.md))
- **♿ Accessible** - WCAG compliant with proper ARIA labels

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool with SWC
- **Tailwind CSS** + shadcn/ui (8 components)
- **React Router** - Client-side routing with state preservation
- **next-themes** - Theme management
- **Netlify** - Hosting with optimized caching and compression

## ⚡ Performance

- **Initial Load**: ~115KB JS + 8.6KB CSS (gzipped)
- **Stats Tab**: +37KB data (403KB → 37KB with gzip)
- **Proforma Tab**: +759KB data (4.2MB → 759KB with gzip, lazy loaded)
- **Total Reduction**: 80% smaller than unoptimized version
- **Build Time**: ~2 seconds

See [PERFORMANCE.md](PERFORMANCE.md) for detailed optimization breakdown.

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Build for production (includes pre-compression)
npm run build

# Preview production build
npm run preview
```

## 🚢 Deployment

This site is optimized for **Netlify** deployment:

1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The `netlify.toml` handles all optimizations automatically

### Deployment Features
- ✅ Automatic gzip compression
- ✅ SPA routing fallback
- ✅ Aggressive asset caching (1 year)
- ✅ Security headers
- ✅ Pre-compressed data files

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components (8 used)
│   ├── ThemeToggle.tsx # Dark/light mode switcher
│   └── StudentHoverCard.tsx # Photo viewer
├── pages/              # Route pages
│   ├── Index.tsx       # Home (Stats & Proforma tabs)
│   ├── CompanyDetails.tsx # Individual company view
│   └── NotFound.tsx    # 404 page
├── lib/                # Core utilities
│   ├── dataCache.ts    # Data fetching with caching
│   ├── constants.ts    # App constants
│   └── branchMapping.ts # Department code mapping
├── utils/              # Helper functions
│   ├── pagination.ts   # Pagination logic
│   └── eligibility.ts  # Eligibility calculations
│   ├── dataCache.ts    # Data caching
│   ├── constants.ts    # App constants
│   └── config.ts
├── utils/              # Helper functions
│   ├── pagination.ts
│   └── eligibility.ts
└── types/              # TypeScript types
```

## 🎯 Performance

| Metric | Value |
|--------|-------|
| JS Bundle | ~115 KB gzipped |
| CSS Bundle | ~8.6 KB gzipped |
| Build Time | ~2 seconds |
| Dependencies | 327 packages |

## 📊 Data Updates

1. Update `public/data/raw/*.json`
2. Run `python public/data/raw/merger_script.py`
3. Build: `npm run build`

## 📝 License

MIT

---

**Note:** Phase 1 data only
