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
- The `/forecast` route has **two IIFEs** in its inline `<script>` blocks:
  1. The original forecast IIFE (`useGeoLocation()`, `loadForecast()`, `renderWind()`, `renderTide()`)
  2. The new sailing-area current map + NWS IIFE
- The original IIFE is the **single source of truth for geolocation**. After `/api/forecast` returns it calls `window.initCurrentMapAt(lat, lon)` to bootstrap the new map. This was previously a duplicated geolocation prompt that caused a race condition — do not re-introduce it.
- DB migrations happen at startup with `try { db.exec("ALTER TABLE …") } catch(e) {}` near line ~880. Always wrap new ALTERs the same way.
- Page rendering uses a `renderPage(html, user, lang)` helper that wraps content in the global header/nav/footer. Page-specific functions return the inner HTML string.

## Conventions
- Edit `src/server.js` directly. No transpile, no framework, no client bundle.
- After non-trivial JS edits run `node -c src/server.js` to syntax-check before committing.
- Commit messages: short imperative subject; commits get auto-deployed to Railway via GitHub integration.
- Don't commit `src/snipe.db-shm` / `src/snipe.db-wal` (SQLite WAL temp files). Stage `src/server.js` explicitly rather than `git add -A`.

## Current work in progress
- **Forecast page polish** (just shipped in commit `7446f04`): fixed dual-geolocation race condition; current map now bootstraps from the same coords as the wind/tide flow.
- **Vakaros API import UI** (just shipped): prominent blue-bordered card at the top of `/coaching`.

## Next features planned
- Wind shift analysis on the forecast page
- Coach-bot chat that references stored telemetry sessions
- Fleet comparison / leaderboard pulled from shared race logs
- Mobile PWA polish for live tracking
- Optional offline cache of past coaching reports
