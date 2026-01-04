# Performance Optimizations

## Data Loading Strategy

### File Sizes
- **stats.json**: 403KB → 37KB gzipped (91% reduction)
- **merged_company_data.json**: 4.2MB → 759KB gzipped (82% reduction)

### Loading Optimizations

1. **Lazy Loading**
   - Stats data loads immediately (smaller, shown first)
   - Company data loads only when Proforma tab is clicked
   - Prevents unnecessary 4.2MB download on initial page load

2. **Promise Caching**
   - Prevents duplicate fetch requests
   - Ensures data is only fetched once even with multiple calls

3. **Preload on Hover**
   - Company data starts loading when user hovers over Proforma tab
   - Reduces perceived load time when switching tabs

4. **Progress Indicator**
   - Visual progress bar shows loading status
   - Better UX for large data files

5. **Pre-compressed Files**
   - `.gz` files generated during build
   - Netlify serves pre-compressed versions automatically
   - Reduces transfer time by ~80%

## Netlify Optimizations

### Caching Strategy
- **Static Assets**: 1 year cache (immutable)
- **Data Files**: 1 hour cache with revalidation
- **HTML**: No cache (always fresh)

### Headers
- Security headers (X-Frame-Options, Content-Type protection)
- Pre-compressed content encoding
- SPA fallback routing

## Build Optimizations

- Code splitting (React vendor, UI vendor, app code)
- CSS code splitting
- ESBuild minification
- Asset optimization with content hashing
- Disabled compression size reporting (faster builds)

## Results

- **Initial Load**: ~115KB JS + 8.6KB CSS (gzipped)
- **Stats Tab**: +37KB data (instant from cache after first load)
- **Proforma Tab**: +759KB data (only loads when needed)
- **Total**: ~920KB for full app vs 4.6MB without optimizations (80% reduction)
- **Build Time**: ~2.2 seconds
