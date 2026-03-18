**Søkerportalen Backend APIs**

**What's suspected:** The application portal at https://sok.samordnaopptak.no/#/ is a single-page application (SPA) that almost certainly uses backend APIs for:
- User authentication and session management
- Application submission and retrieval
- Study program database queries
- Document upload and storage
- Decision notifications
- Payment processing (if tuition collection is handled)

**Evidence:**
1. Hash-based URL routing (`#/`) is characteristic of JavaScript SPAs (React, Vue, Angular)
2. The main informational site (www.samordnaopptak.no) is purely read-only and static (Vortex CMS)
3. The portal handles stateful user interactions (login, form submission, file upload, decision display) that require backend endpoints
4. Embedded study search links (`https://sok.samordnaopptak.no/#/admission/18/studies`, `https://sok.samordnaopptak.no/#/admission/19/studies`) suggest API calls to fetch program data
5. No direct API documentation is published or linked from the main site

**Confidence:** **Medium–High** (inferred from architecture patterns)

**How to investigate:**
1. Visit https://sok.samordnaopptak.no/#/ in a modern browser
2. Open developer tools (F12 or right-click → Inspect)
3. Go to **Network tab**
4. Perform actions: log in, search programs, fill out form, submit
5. Examine **XHR (XMLHttpRequest) / Fetch** calls
6. Document the request URLs, methods (GET/POST), and response structures
7. Check **Console** for any exposed API endpoints or error messages
8. Note authentication headers (Authorization, Bearer tokens, session cookies)

**Likely endpoints (unverified):**
- User management: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- Applications: `/api/applications`, `/api/applications/{id}`
- Programs: `/api/programs`, `/api/programs/{id}`, `/api/programs/search`
- Documents: `/api/documents/upload`, `/api/documents/{id}`
- Decisions: `/api/decisions`, `/api/decisions/{id}`

**Why not documented in main site:**
- Søkerportalen is maintained separately and is internal-facing for applicants (authenticated users only)
- Public API documentation is not a priority for a government admissions system
- Backend is likely managed by a separate team from the informational site

**Recommendation:**
- If agent needs to interact with søkerportalen data programmatically, investigate via browser dev tools to reverse-engineer API contracts
- For human users, the web interface at https://sok.samordnaopptak.no/#/ is the intended access point (no documented API for third-party integration)
- Contact Samordna opptak directly (via `/om/kontakt/`) for any API partnership or data access requests