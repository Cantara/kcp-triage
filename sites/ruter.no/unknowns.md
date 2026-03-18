## Suspected APIs & Backends

### 1. Journey Planner Backend (reise.ruter.no)
**What's suspected:** The interactive journey planner at https://reise.ruter.no/ is a Single Page Application (SPA) that must query a backend routing engine to return trip suggestions, schedules, real-time vehicle positions, and delays.

**Evidence:**
- The UI dynamically loads journey results without page refresh
- Real-time data (current delays, vehicle positions) appears instantly
- Searches are responsive, suggesting API-based backend rather than static HTML
- Page contains Astro hydration markers but core functionality is interactive/client-side

**Inferred endpoints (high confidence):**
- GET `/api/journeys` or `/routing/v1/...` — queries routes for origin/destination/time
- GET `/api/stops` or `/autocomplete` — autocompletes stop/address names
- GET `/api/departures` or similar — fetches real-time departure data
- GET `/api/disruptions` or `/alerts` — real-time service alerts by line/stop
- Likely uses **GTFS (General Transit Feed Specification)** data + real-time extensions (GTFS-RT)

**Technology hints:**
- Possibly **OpenTripPlanner** or proprietary routing engine
- Real-time feed likely from Ruter's operations center
- API probably uses REST + JSON or GraphQL

**How to verify:**
1. Open https://reise.ruter.no/ in a browser
2. Open Developer Tools (F12) → Network tab
3. Search for a journey
4. Inspect XHR/Fetch calls to see actual API endpoints, request payloads, and response structure
5. Document endpoint URLs, query parameters, response schema

**Confidence:** High (inferred from SPA behavior and real-time data)

---

### 2. Real-Time Status/Disruptions API
**What's suspected:** The Trafikkstatus page (https://ruter.no/trafikkstatus) displays current service disruptions, delays, and alerts. This data must be fetched from a live backend rather than static content.

**Evidence:**
- Status page auto-updates every 30-60 seconds
- Disruption data changes in real-time
- Page is not rebuilt statically; updates happen client-side
- Timestamps show last update time

**Inferred endpoints (medium-high confidence):**
- GET `/api/disruptions` — fetches current active disruptions by transport type/line
- GET `/api/alerts` — service alerts and planned maintenance
- GET `/api/lines` — list of all lines with current status
- Possibly WebSocket for real-time push notifications

**How to verify:**
1. Visit https://ruter.no/trafikkstatus
2. Open Developer Tools → Network tab
3. Watch for API calls every 30-60 seconds
4. Inspect the response to understand data schema (which fields indicate delay time, affected lines, duration, etc.)

**Confidence:** High (observable auto-refresh behavior)

---

### 3. User Account Portal API (minside.ruter.no)
**What's suspected:** The separate domain minside.ruter.no is a user authentication and account management portal. It must have backend APIs for login, user data, saved journeys, and preferences.

**Evidence:**
- Separate subdomain dedicated to authenticated user functionality
- Login redirect from main site to minside.ruter.no
- Users can manage account, saved trips, payment methods (inferred)
- Session/authentication required

**Inferred endpoints (medium confidence):**
- POST `/auth/login` — user authentication
- POST `/auth/logout` — session termination
- GET `/api/user` — fetch authenticated user profile
- GET `/api/journeys/saved` — saved trip routes
- POST `/api/journeys/save` — save a journey
- GET `/api/payment-methods` — user's stored payment methods (if any)
- PUT `/api/user/preferences` — update user settings

**Authentication:**
- Likely session-based or token-based (JWT)
- Norwegian ID (personnummer) or email-based login

**How to verify:**
1. Visit https://minside.ruter.no/
2. Attempt login (if you have credentials) or observe redirects
3. Open Developer Tools → Network tab
4. Inspect POST requests to auth endpoints
5. Check for Authorization headers, session cookies

**Confidence:** Medium-high (separate authenticated domain strongly suggests backend APIs)

---

### 4. Contact & Feedback Form API (kontakt.ruter.no)
**What's suspected:** The contact form at https://kontakt.ruter.no/no/transportmiddel-og-stoppested accepts structured feedback submissions (incidents, lost & found, complaints). These must be processed by a backend.

**Evidence:**
- Separate domain for contact/feedback
- Form with multiple fields (transport type, stop, incident description)
- Form submissions require processing and storage

**Inferred endpoints (medium confidence):**
- POST `/api/feedback` or `/incidents` — submit incident/feedback
- Possibly GET `/api/stops` — autocomplete stop names in form
- Possibly GET `/api/lines` — list of lines for selection

**How to verify:**
1. Visit https://kontakt.ruter.no/no/transportmiddel-og-stoppested
2. Open Developer Tools → Network tab
3. Fill out and submit a test form
4. Inspect POST request (be careful not to submit actual feedback)
5. Document endpoint, request body schema, response

**Confidence:** Medium (form submission behavior)

---

### 5. Sanity CMS Content API
**What's suspected:** Ruter uses Sanity CMS as a headless backend. The Astro site likely queries Sanity's API to fetch content (pages, news, articles, event info).

**Evidence:**
- Classification explicitly mentions Sanity CMS
- Astro is a static/hybrid framework that integrates with headless CMS
- Main ruter.no pages are content-rich (news, help articles, project info) — typical CMS use case

**Inferred endpoints (high confidence):**
- Sanity GraphQL API: `https://[project-id].api.sanity.io/v1/graphql/production`
- Sanity REST API: `https://[project-id].api.sanity.io/v1/data/query/production`
- Likely queries for: pages, news articles, FAQs, project descriptions

**How to verify:**
1. Inspect page source (Ctrl+U) for any Sanity API references or project IDs
2. Check Astro config files if accessible (astro.config.mjs)
3. Look for environment variables referencing Sanity (SANITY_PROJECT_ID, SANITY_API_KEY in build logs)
4. Query Sanity's public GraphQL endpoint if project is public:
   - Try: `https://[project-id].api.sanity.io/v1/graphql/production`

**Confidence:** High (explicitly mentioned in tech stack)

---

## Summary: Recommended API Investigation

| API | Certainty | Priority | Method |
|-----|-----------|----------|--------|
| Journey Planner (reise.ruter.no) | High | High | Network tab inspection on trip search |
| Disruptions/Status | High | Medium | Network tab on auto-refresh at trafikkstatus |
| Sanity CMS | High | Medium | Source inspection + Sanity API probing |
| User Portal (minside.ruter.no) | Medium | Low | Authentication/session analysis (requires login) |
| Contact Form (kontakt.ruter.no) | Medium | Low | Form POST inspection |

## Documentation Gaps
None of these APIs are documented publicly on ruter.no. All endpoints, schemas, and rate limits are inferred from behavior and would require:
1. **Network traffic inspection** (primary method)
2. **Reverse engineering** from frontend code
3. **Direct inquiry** with Ruter (if they release public API docs)
4. **Accessing Sanity's documentation** for CMS integration details
