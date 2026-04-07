# Snipeovation.com — AI Snipe Sailing Coaching Tool

## Tech stack
- **Runtime:** Node.js + Express
- **Database:** SQLite (`better-sqlite3`), file at `src/snipe.db`
- **Hosting:** Railway (auto-deploys on push to `main`)
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`) — requires `ANTHROPIC_API_KEY` env var
- **Frontend:** Server-rendered HTML template literals inside `src/server.js` (no build step, no framework). Charts via Chart.js CDN. Maps via Leaflet CDN.

## Repository
- **GitHub:** [CharlesLGreen/sailboat-racing-genius-tool](https://github.com/CharlesLGreen/sailboat-racing-genius-tool)
- **Branch:** `main`
- **Deployment:** Railway is connected to the GitHub repo and auto-deploys on every push to `main`. Manual deploys via `railway up --service snipe-app`.

## Key files
| File | Purpose |
|---|---|
| `src/server.js` | **Single-file backend + frontend.** ~9500 lines. All Express routes, SQL schema migrations, page templates, and inline JS live here. Edit with surgical care. |
| `package.json` | Dependencies + `start` script (`node src/server.js`) |
| `src/snipe.db` | SQLite database (committed; production data lives on Railway volume) |
| `.claude/settings.local.json` | Claude Code permissions for this repo |

## Features built
### Race logging & profile
- Quick Entry + full Log Race forms with boat selector, sail/tuning settings, wind & sea state, finish positions
- Race feed with data-sharing opt-in (`auto-share existing racers`)
- Profile page with My Boats section, personal boat management
- Multi-language UI (en / es / it / pt)

### AI Coaching (`/coaching`)
- "Get My Coaching Report" → Claude analyzes ALL race history + Vakaros telemetry → personalized report
- Past coaching reports list with read-aloud (Web Speech API) and Share-with-Crew
- Data completeness scoring + "Improve Your Coaching" guidance section

### Vakaros integration (`// --- VAKAROS COACH ---` in server.js)
- **CSV upload path** — Vakaros Connect → Export → Share → Snipeovation
- **REST API import path** via `teleapi.regatta.app`:
  - Save Vakaros API token (`/vakaros/token`)
  - Look up event by ID, browse divisions/races (`/vakaros/api/events/:event_id`)
  - Import telemetry by event/division/time-range (`/vakaros/import-event`)
- **Live race tracking** (`/vakaros/live/:event_id`) — Leaflet map + WebSocket to `wss://live.regatta.app/ws`, shows boats with sail numbers, course marks, race stage, OCS/STARTED badges. Includes SCIRA Rule 28 disclaimer banner.
- DB tables: `vakaros_uploads`, `vakaros_coaching`, `vakaros_api_keys`

### Forecast page (`/forecast`)
- **24-hour wind forecast chart** (Open-Meteo, color-coded by strength)
- **Hourly wind direction chart**
- **Tide / current predictions chart** (NOAA CO-OPS)
- **Sailing Area Current Map** — Leaflet, top-of-page-after-charts
  - Searches NOAA stations within 50 km (up to 12)
  - Inverse-distance-weighted vector interpolation builds a 2 km arrow grid out to 40 km radius
  - Land filter: skip grid points more than 12 km from any NOAA station (water proxy)
  - SVG arrows with 2:1 tail:head ratio, zoom-responsive sizing (10–24 px), color-coded by speed (blue / yellow / red)
  - Speed labels on station arrows always; on grid arrows at zoom ≥ 13
  - 24-hour time slider re-interpolates the whole field
  - Nominatim search box for "Biscayne Bay" etc., plus "📍 My Location" button
- **7-Day Wind Forecast** — `api.weather.gov` (US-only), card grid with rotated arrow icons, color-coded border by wind strength, dark navy theme

### Coaching extras
- Class rules + RRS lookup pages
- Sailing-specific calculators
- Event listings with auto pre-fill (e.g. "Don Q Regatta" during April 5–7)
- PWA install banner

## Architecture notes
- The `/forecast` route has **three independent IIFEs** in its inline `<script>` blocks. Each one is fully self-contained — do not introduce cross-IIFE coupling, it caused multi-day breakage:
  1. **Original forecast IIFE** — `loadForecast()`, `renderWind()`, `renderTide()`, render the 24-hour wind chart, hourly wind direction chart, and tide chart. Tries `navigator.geolocation` on auto-load and falls back to Miami `(25.7617, -80.1918)` if denied.
  2. **Sailing Area Current Map IIFE** — Leaflet map, NOAA CO-OPS multi-station + interpolated grid arrows. Initializes immediately with Miami coords on its own (no geolocation prompt). Has its own search box and "📍 My Location" button.
  3. **7-Day NWS Wind Forecast IIFE** — `api.weather.gov/points/{lat},{lon}` → `forecastHourly`. Initializes immediately with Miami coords on its own.
- `/api/forecast` backend:
  - **Wind primary source: NWS** `api.weather.gov` (same API the 7-day forecast uses, confirmed reachable from Railway). Open-Meteo is a non-US fallback only.
  - **Tide:** searches NOAA CO-OPS waterlevels stations within 0.5°. Unconditional **Virginia Key (8723214) hardcoded fallback** if no station found, so the route always returns tide data for the Miami area.
  - Each external fetch is wrapped in its own `try/catch` with content-type guards. A failure in one source no longer kills the whole response. Failures log to the server console with status + content-type for diagnosis.
- DB migrations happen at startup with `try { db.exec("ALTER TABLE …") } catch(e) {}` near line ~880. Always wrap new ALTERs the same way.
- Page rendering uses a `renderPage(html, user, lang)` helper that wraps content in the global header/nav/footer. Page-specific functions return the inner HTML string.

## Conventions
- Edit `src/server.js` directly. No transpile, no framework, no client bundle.
- After non-trivial JS edits run `node -c src/server.js` to syntax-check before committing.
- For network-dependent backend changes, also run a quick boot test:
  `PORT=39880 node src/server.js` and `curl http://localhost:39880/api/forecast?lat=25.7617&lon=-80.1918`
- Commit messages: short imperative subject; commits get auto-deployed to Railway via GitHub integration.
- Don't commit `src/snipe.db-shm` / `src/snipe.db-wal` (SQLite WAL temp files). Stage `src/server.js` explicitly rather than `git add -A`.
- When adding NEW sections to a complex page, **add them as fully isolated `<div>` + new `<script>` IIFE blocks** rather than modifying existing IIFEs. This avoids the kind of cross-IIFE breakage that took several commits to untangle.

## Recently fixed / shipped today
- **Forecast wind switched to NWS** (`401262f`) — Open-Meteo isn't reachable from Railway, so wind was returning null and the chart was blank. The route now uses `api.weather.gov` (proven reachable on Railway via the 7-day forecast). Returns 24 hourly periods with knots speeds, degree directions, and 1.3× gust estimates.
- **Forecast page restored cleanly** (`c8e2f6b`) — earlier in the day a series of cumulative edits to the forecast route had broken the original wind/tide charts. Restored the entire `/forecast` route from commit `7181955` verbatim, then re-added the Sailing Area Current Map and 7-Day NWS Forecast as fully isolated additive sections.
- **Wind/tide route hardened** (`7d41d71`, `65b9a04`) — every external fetch now has its own try/catch, content-type guard, and timeout. A single API hiccup no longer 500s the whole forecast response.
- **Virginia Key tide fallback** (`e2399ad`, refined in `7d41d71`) — unconditional hardcoded fallback to NOAA station 8723214 so users never see "no NOAA tide station found" in the Miami area.
- **GPS-first auto-load** (`401262f`) — `/forecast` tries `navigator.geolocation` first and falls back to Miami coords only on denial / unavailable / 6s timeout.

## Status of all features
| Feature | Status |
|---|---|
| Quick race log + full race log + boats | ✅ shipped |
| Race feed + data sharing opt-in | ✅ shipped |
| AI coaching report (Claude Sonnet) | ✅ shipped |
| Vakaros CSV upload + share-from-app flow | ✅ shipped |
| Vakaros REST API import (token, event lookup, division/race import) | ✅ shipped |
| Vakaros live race tracking page (Leaflet + WebSocket) | ✅ shipped |
| `/forecast` 24-hour wind chart (NWS) | ✅ shipped — fixed today |
| `/forecast` hourly wind direction chart | ✅ shipped |
| `/forecast` tide / current chart (NOAA, Virginia Key fallback) | ✅ shipped |
| `/forecast` Sailing Area Current Map (multi-station + grid) | ✅ shipped |
| `/forecast` 7-Day NWS wind forecast | ✅ shipped |
| RRS + class rules lookup pages | ✅ shipped |
| Multi-language (en / es / it / pt) | ✅ shipped |
| PWA install banner | ✅ shipped |

## Next features planned
- Wind shift analysis on the forecast page
- Coach-bot chat that references stored telemetry sessions
- Fleet comparison / leaderboard pulled from shared race logs
- Mobile PWA polish for live tracking
- Optional offline cache of past coaching reports
