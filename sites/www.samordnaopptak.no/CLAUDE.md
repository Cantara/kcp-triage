# Samordna opptak (NUCAS) — Site Orientation

## Site Identity
**Domain:** www.samordnaopptak.no  
**Full Name:** Samordna opptak (Norwegian Universities and Colleges Admission Service / NUCAS)  
**Operator:** University of Oslo (@unioslo)  
**Purpose:** Central coordinator and administrator of student admissions to Norwegian universities, university colleges, and vocational schools (fagskoler). Provides official guidance on applications, deadlines, requirements, and admissions processes for prospective students.

## Interaction Model
**Read-only informational site.** The main www.samordnaopptak.no domain serves purely informational and procedural content. There is NO direct application submission, authentication, or payment processing on this domain.

### Allowed Operations (Always)
- Browse all public pages and sections
- Read application guides, deadlines, requirements, and admission rules
- View informational videos about the admissions process
- Search the site and access study program overviews
- Access English-language content for international applicants
- View statistics, point calculations, and admission quotas
- Access contact information and administrative details

### External Portal (Separate Domain)
The actual application portal is at **https://sok.samordnaopptak.no/#/** — a separate single-page application with its own authentication and submission workflows. This site links to that portal but does not host it. Do not attempt to interact with the portal directly unless explicitly instructed by the user; instead, guide them to the portal's entry point.

### Never Do
- Do not attempt to submit applications, register users, or log in to the søkerportalen
- Do not attempt to modify, delete, or change any data
- Do not access or manipulate administrative or internal systems

## Navigation & URL Patterns

### Main Sections
- **Home:** `/` (Forsiden)
- **Apply to Universities/Colleges:** `/universitet-og-hogskole/` — guides, requirements, deadlines, point calculations, quotas
- **Apply to Vocational Schools:** `/fagskole/` — guides, requirements, deadlines, point calculations
- **Information Videos:** `/filmer/` — video tutorials on application, post-submission steps, documentation, prioritization
- **About:** `/om/` — what is Samordna opptak, contact info, statistics, privacy policy
- **English Information:** `/english/` — international applicant information, general requirements, language requirements, tuition info

### Key Entry Points
- Study search portals (embedded links to `sok.samordnaopptak.no`):
  - University/College studies: `https://sok.samordnaopptak.no/#/admission/18/studies`
  - Vocational school studies: `https://sok.samordnaopptak.no/#/admission/19/studies`
- Application portal: `https://sok.samordnaopptak.no/#/`

### Deadlines & Timelines
- Main application deadlines for 2026 vary by program type (15 April, 1 July, 20 July)
- Detailed timeline at `/universitet-og-hogskole/tidsfrister` and `/fagskole/tidsfrister`

### Secondary Pages
- Electronic transcripts (vitnemål): `/universitet-og-hogskole/slik-soker-du/elektronisk-vitnemal.html`
- After application: `/jeg-har-sokt-hva-skjer-na.html` — describes next steps, documentation, processing timeline
- Statistics & point borders: `/om/tall-og-statistikk/`, `/universitet-og-hogskole/poengberegning/poenggrenser.html`
- Preparation guide: `/aktuelt/forberedelser-soke-samordna-opptak.html`

## Tech Stack
- **CMS:** Vortex CMS
- **Frontend:** Static/dynamic HTML served via Vortex; external portal is a single-page application (React/Vue likely, based on `#/` hash routing)
- **Languages:** Norwegian (primary), English (secondary)

## Authentication & External Systems
- **Main site:** No authentication required (read-only)
- **Application portal (sok.samordnaopptak.no):** Requires user registration and login; handles credential entry, application submission, document uploads, and status tracking
- **Electronic transcripts:** Accessible via the søkerportalen after login

## Rate Limiting & Politeness
Robots.txt specifies:
- Disallow: `/vrtx`, `/info2`, `/info-arkiv/` (internal/archived)
- Sitemap: https://www.samordnaopptak.no/sitemap.xml
- No explicit crawl-delay. Treat as a normal government site; use reasonable delays between requests.

## Available Skills
1. **navigate** — Move through site sections, search study programs, find deadlines and requirements
2. **find-admission-requirements** — Locate and interpret admission rules, point calculations, quotas, language requirements
3. **understand-application-process** — Guide through the step-by-step application workflow and post-submission timeline
4. **find-study-programs** — Search and filter study offerings for universities, colleges, and vocational schools
5. **access-international-info** — Navigate English-language content and international applicant resources
