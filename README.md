# GitScope — GitHub Repository Intelligence

Search, inspect and compare public GitHub repositories using the live GitHub REST API (no token required).
[**Live Demo**](https://gitscope-peach.vercel.app/) | [**Source Code**](https://github.com/jackosama139-code/GitScope)
## Features
- **Explore**: search with GitHub qualifiers, language filter, sorting, pagination, example searches, recent-search history (rerun / clear).
- **Repository details** (`/repo/:owner/:name`): stats, license, dates, topics, language chart with text summary, top contributors, recent commits, favorite toggle. Each section loads from its own endpoint and has its own error/retry state.
- **Compare** (`/compare?a=owner/name&b=owner/name`): autocomplete pickers, side-by-side table, "Higher" marker (text, not color alone) for numeric metrics only, unavailable values shown as "Unavailable".
- **Favorites**: persisted in localStorage; stale (404) favorites show saved details with a warning.
- **Settings**: light/dark theme, clear local data, rate-limit explainer.

## Stack
React 18, TypeScript (strict), Vite, Tailwind CSS, React Router, Recharts, Lucide, Vitest + React Testing Library.

## Structure
```
src/components  reusable UI (RepoCard, LanguageChart, States, Layout)
src/pages       route screens (lazy-loaded: RepoDetail, Compare)
src/hooks       useAsync (abortable fetch), useDebounce, useLocalStorage
src/services    github.ts: single API layer, errors, cache, rate-limit headers
src/context     AppContext: favorites, recents, theme, toasts
src/utils       formatting and comparison helpers
src/test        unit/component tests
```

## Commands
```
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run test
npm run lint
```

## API usage and limits
Unauthenticated GitHub API: roughly 60 requests/hour per IP, lower per-minute limit for search. GET responses are cached in memory for 5 minutes. Remaining quota from `x-ratelimit-*` headers is shown in the footer. 403/404/422/429 and network failures show specific messages with retry where useful. If you later add authenticated access, do it through a backend; never ship a token in frontend code.

## Performance
Debounced search (500 ms); in-flight requests aborted when inputs change or components unmount; 5-minute response cache; lazy-loaded routes; memoized repo cards; lazy-loaded, size-fixed avatars requested at 64px. No performance numbers are claimed; measure with Lighthouse/DevTools.

## Accessibility
Semantic landmarks, skip link, labelled controls, visible focus rings, `aria-live` status/alerts, `aria-pressed` favorite buttons, chart text summaries, reduced-motion support. Not formally audited; run axe/Lighthouse before claiming conformance.

## Known limitations
- No Playwright end-to-end tests yet.
- Autocomplete is a simple suggestion list, not a full ARIA combobox.
- Search is limited to GitHub's first 1,000 results.
- Rate limits can make the app unusable temporarily without a token.

## Deploy
Static host (Vercel/Netlify): build command `npm run build`, output `dist`. Add an SPA rewrite of all paths to `/index.html` so `/repo/...` URLs work on refresh.

## What I Learned

- Building reusable UI components with React.
- Using TypeScript to structure frontend code.
- Integrating an external API and handling asynchronous requests.
- Managing loading, error, and pagination states.
- Presenting repository data through interactive visualizations.
- Building responsive interfaces with Tailwind CSS.

## Screenshots

### Explore Page

![GitScope Explore Page](screenshots/Explore%20page.png)

### Compare Page

![GitScope Compare Page](screenshots/Compare%20page.png)

### Favorites Page

![GitScope Favorites Page](screenshots/Favorites%20page.png)

### Settings Page

![GitScope Settings Page](screenshots/Settings%20page.png)

