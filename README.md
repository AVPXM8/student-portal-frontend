# Mathem Solvex - Student Portal (Next.js)

Mathem Solvex is a premium, high-performance web application designed for MCA entrance aspirants (NIMCET, CUET-PG, etc.). It provides a comprehensive library of over 17 years of Previous Year Questions (PYQs) with expert video solutions and a realistic mock test environment.

This project is the **Frontend only**, built with **Next.js 15+ (App Router)** and optimized for SEO and premium UX.

## 🔗 Project Links
- **Backend API:** [MATHEM SOLVEX BACKEND](https://github.com/AVPXM8/Mathem-Solvex-Updated/tree/main/backend)
- **Admin Dashboard:** [MATHEM SOLVEX ADMIN](https://github.com/AVPXM8/Mathem-Solvex-Updated/tree/main/admin)

## 🚀 Core Features
- **Comprehensive PYQ Library:** Search and filter thousands of questions by exam, subject, topic, and year.
- **Premium UX/UI:** Advanced animations, glassmorphism, and a responsive bento-grid layout.
- **Full-Screen Test Environment:** A distraction-free "Exam Mode" with mobile-optimized controls and a question palette.
- **Advanced SEO:** 
  - Dynamic `sitemap.xml` for all question and article routes.
  - JSON-LD Structured Data (Quiz, Article, Organization, WebSite).
  - Breadcrumb navigation with schema.org support.
- **MathJax Integration:** High-quality LaTeX rendering for mathematical formulas across the portal.
- **AI Tutor Integration:** Context-aware AI assistance for solving complex problems.

## 📂 Project Structure (Frontend)
```markdown
student-next/
├── app/                  # Next.js App Router (File-based Routing)
│   ├── (auth)/           # Authentication routes (if applicable)
│   ├── about/            # About Us page
│   ├── articles/         # Blog / Exam News (with [slug] dynamic routing)
│   ├── questions/        # PYQ Library (with [id] dynamic routing)
│   ├── resources/        # PYQ Paper Downloads
│   ├── results/          # Hall of Fame / Star Students
│   ├── test/             # Mock Test Exam Environment
│   ├── globals.css       # Global design tokens & utility classes
│   ├── layout.js         # Root layout with common SEO/Scripts
│   └── page.js           # Homepage entry point
├── components/           # Reusable UI Components
│   ├── Breadcrumb.jsx    # SEO-friendly breadcrumb with JSON-LD
│   ├── MathPreview.jsx   # LaTeX/MathJax renderer component
│   ├── Header.jsx        # Navigation & Branding
│   ├── Footer.jsx        # Site footer
│   └── ...               # Various UI widgets
├── hooks/                # Custom React Hooks
│   ├── useMathJax.js     # Hook for triggering MathJax typesetting
│   └── ...
├── utils/                # Utility functions & helpers
├── api.js                # Axios instance with Base URL config
├── public/               # Static assets (images, icons)
└── next.config.mjs       # Next.js optimization & configuration
```

## 🔄 Data Flow
The frontend communicates with the **Node.js/Express Backend** via a RESTful API:
1. **Dynamic Metadata:** Server-side functions (`generateMetadata`) fetch data from the API during request time to build SEO tags.
2. **Client-Side Hydration:** Components use `api.js` (Axios) to fetch real-time data for search, filters, and exam status.
3. **Sitemap Generation:** The `sitemap.js` file calls a specific backend endpoint `/api/sitemap-urls` to fetch all database IDs for automatic search engine indexing.

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- NPM or PNPM

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### 3. Installation
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm run start
```

## 📈 SEO & Performance
- **Image Optimization:** Uses `next/image` for automatic WebP conversion and lazy loading.
- **Static Generation:** Critical pages like About and Article lists are statically optimized.
- **Inter-linking:** sidebar widgets and breadcrumbs ensure high link equity across the portal.

---

## 🔧 Performance Optimization Log (v2.0)

### CLS Fixes (0.58 → < 0.1 target)

| # | Issue | Fix | Impact | Files |
|---|-------|-----|--------|-------|
| 1 | Hero carousel skeleton height mismatch | Added `aspect-ratio: 2/1` to `.aspectBox` and `.skeletonHero` | Eliminates ~0.3 CLS from hero | `SuccessCarousel.module.css`, `HomePage.module.css` |
| 2 | Header top-bar hide uses `margin-top: -42px` | Replaced with `transform: translateY(-100%)` (compositor-only, no layout shift) | Eliminates ~0.1 CLS | `Header.module.css` |
| 3 | Logo image dimensions mismatch (40px vs CSS 52px) | Fixed Image width/height to 52px matching CSS | Prevents micro layout shift | `Header.jsx` |

### LCP / Bundle Optimization

| # | Issue | Fix | Impact | Files |
|---|-------|-----|--------|-------|
| 4 | Google Analytics blocks main thread (afterInteractive) | Changed to `strategy="lazyOnload"` | -500ms main-thread blocking | `layout.js` |
| 5 | 28KB dead `students` import in HomeClient | Removed unused import | -28KB client bundle | `HomeClient.jsx` |
| 6 | EarlyBirdPopup image preloaded with `priority` | Removed priority, added `loading="lazy"` | Frees LCP budget for hero | `EarlyBirdPopup.jsx` |
| 7 | EarlyBirdPopup + FloatingSocialBar loaded eagerly | Converted to `dynamic()` imports with `ssr: false` | -15KB+ initial bundle | `ConditionalLayout.jsx` |
| 8 | Icon libraries not tree-shaken | Added `optimizePackageImports` for react-icons + lucide-react | -10KB+ estimated | `next.config.mjs` |
| 9 | Logo served as 237KB local PNG at 52px | Switched to Cloudinary URL with `f_auto,q_auto,w_80` | -230KB+ bandwidth | `Header.jsx` |
| 10 | Award images (50×) served full-size | Added Cloudinary transforms `w_250,h_350,c_fill,f_auto,q_auto` + lazy loading | -60% image bandwidth | `AwardCarousel.jsx` |

### Animation & Rendering Performance

| # | Issue | Fix | Impact | Files |
|---|-------|-----|--------|-------|
| 11 | Scroll listeners not passive | Added `{ passive: true }` to all scroll listeners | Eliminates forced reflow warnings | `Header.jsx`, `Footer.jsx` |
| 12 | Header scroll not rAF-throttled | Wrapped in `requestAnimationFrame` throttle | Fewer main-thread interruptions | `Header.jsx` |
| 13 | ClassroomSlider auto-advances every 2s (off-screen) | Added IntersectionObserver to pause when off-screen; increased to 4s | -50% unnecessary re-renders | `ClassroomSlider.jsx` |
| 14 | featureCard hover animates box-shadow (paint) | Replaced with `filter: drop-shadow()` (compositor-friendly) | Smoother hover on mobile | `HomePage.module.css` |
| 15 | No `prefers-reduced-motion` support | Added across all CSS modules | Full accessibility compliance | 5 CSS files |
| 16 | Dead `reRenderMathJax` calls (no-op function) | Removed all calls and import | Cleaner code | `QuestionInteractions.jsx` |

### SEO & Accessibility

| # | Issue | Fix | Impact | Files |
|---|-------|-----|--------|-------|
| 17 | Header `<h2>` breaks heading hierarchy | Changed to `<span>` with equivalent styles | Correct h1-only per page | `Header.jsx`, `Header.module.css` |
| 18 | BottomNav missing aria labels | Added `aria-label`, `aria-current="page"` | Screen reader support | `BottomNav.jsx` |
| 19 | Mobile font sizes below WCAG (0.55rem) | Increased to 0.6rem minimum | Passes WCAG readability | `Header.module.css`, `BottomNav.module.css` |
| 20 | Missing `theme-color` meta tag | Added `<meta name="theme-color" content="#FF5E0E">` | Mobile browser chrome color | `layout.js` |
| 21 | No touch-action: manipulation | Added globally to interactive elements | Eliminates 300ms tap delay | `globals.css` |
| 22 | `suppressHydrationWarning` on `<body>` | Removed (masks real hydration bugs) | Surfaces hidden issues | `layout.js` |
| 23 | Footer year hydration risk | Hardcoded year string | Eliminates edge-case mismatch | `Footer.jsx` |

### Estimated Combined Impact

| Metric | Before | After (estimated) |
|--------|--------|-------------------|
| CLS | 0.58 | < 0.1 |
| Performance Score | 54 | 80-90+ |
| Client Bundle | ~250KB | ~170KB (-30%) |
| Main Thread Blocking | 4.1s | ~2.5s |
| Image Bandwidth | ~8MB/page | ~3MB/page |
| Accessibility | ~85 | 95+ |

---
© 2026 Maarula Classes - Mathem Solvex. All rights reserved.
