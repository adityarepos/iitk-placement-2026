# IITK Placement 2026

> Student placement statistics and company proformas for IIT Kanpur 2026 placement season.

## 🚀 Live Demo

**Visit:** [https://adityarepos.github.io/iitk-placement-2026/](https://adityarepos.github.io/iitk-placement-2026/)

## ✨ Features

- **📊 Stats Dashboard** - Browse student placement data with advanced search and filtering
- **🏢 Company Proformas** - Detailed job descriptions, eligibility criteria, and compensation packages
- **📅 Timeline Events** - Company-specific notices and updates
- **🎨 Dark Mode** - Seamless dark/light theme switching with smooth transitions
- **📱 Mobile Responsive** - Optimized for all screen sizes (mobile, tablet, desktop)
- **⚡ Performance Optimized** - Lazy loading, code splitting, and efficient data caching
- **♿ Accessible** - WCAG compliant with proper ARIA labels

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** + shadcn/ui
- **React Router** - Client-side routing
- **next-themes** - Theme management

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ThemeToggle.tsx
├── pages/              # Route pages
│   ├── Index.tsx       # Home (Stats & Proforma)
│   └── CompanyDetails.tsx
├── lib/                # Core utilities
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
