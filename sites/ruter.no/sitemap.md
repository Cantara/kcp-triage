# Ruter.no Site Structure

## Main Sections

### Home & Navigation Hub
- **URL:** https://ruter.no/
- **Purpose:** Landing page with search, quick links to all major sections
- **Key CTA:** "Reisesøk" (journey search) → reise.ruter.no

### Journey Planning
- **URL:** https://ruter.no/planlegg-reise
- **Subsections:**
  - Reiseplanlegger (journey planner link)
  - Trafikkstatus (current disruptions)
  - Rutetabeller og linjekart (route tables & line maps)
  - Ruter-appen (mobile app info)
- **External:** https://reise.ruter.no/ (separate SPA for trip queries)

### Real-Time Status
- **URL:** https://ruter.no/trafikkstatus
- **Purpose:** Current service disruptions, delays, route status by transport type
- **Data Source:** Real-time status feed (likely API-driven)

### Tickets & Fares
- **URL:** https://ruter.no/om-vare-billetter
- **Subsections:**
  - Enkeltbillett (single trip tickets)
  - Periodebillett (passes: 24h, 7d, 30d, 365d)
  - Her kjøper du billett (purchase channels: app, physical card, on-vehicle)
  - Turistbillett (tourist passes & Oslo Pass integration)
  - Billettpriser (pricing overview)
- **Purchase Channels Linked:** Ruter app, physical cards at retailers, on-board payment

### School Transport (Skoleskyss)
- **URL:** https://ruter.no/skoleskyss
- **Subsections:**
  - Skoleskyss i Akershus (Ruter-managed, eligibility & application)
  - Skoleskyss i Oslo (links to Oslo kommune)
  - New skoleskyss solution (replaces RuterBestilling)
- **Access:** Info pages only; applications via separate portals

### Help & Support
- **URL:** https://ruter.no/fa-hjelp-og-kontakt
- **Subsections:**
  - Kontakt oss (phone, form, address)
  - Gi oss tilbakemelding (feedback form)
  - FAQs grouped by topic (tickets, accessibility, complaints, etc.)
- **External:** https://kontakt.ruter.no/no/transportmiddel-og-stoppested (detailed contact form)

### About Ruter
- **URL:** https://ruter.no/om-oss
- **Subsections:**
  - Sånn er vi organisert (organizational structure)
  - Jobb i Ruter (careers)
  - Vårt oppdrag (mission & values)
  - Pressesenter (news & media)

### Projects & Development
- **URL:** https://ruter.no/prosjekter-og-nyutvikling
- **Major Projects:**
  - Det store T-baneløftet (T-bane modernization 2024-2026)
  - Links to external partners (Sporveien, Oslo kommune)

### News & Updates
- **URL:** https://ruter.no/nyheter/[slug]
- **Examples:** 90-dagersbillett announcement, T-bane updates

## Separate Subdomains

### Journey Planner (SPA)
- **URL:** https://reise.ruter.no/
- **Purpose:** Interactive trip search, departure boards, real-time routing
- **Technology:** React/Vue SPA (inferred)
- **Features:** Departure search, journey suggestions, line disruptions, accessibility filters
- **Data:** Likely backed by OpenTripPlanner or similar GTFS-based routing engine

### User Account Portal
- **URL:** https://minside.ruter.no/
- **Purpose:** Login required; manage saved journeys, payment methods, travel history
- **Technology:** Web app with authentication
- **Access:** "Logg inn" (Log in) link in top nav

### Contact & Feedback
- **URL:** https://kontakt.ruter.no/no/transportmiddel-og-stoppested
- **Purpose:** Structured feedback form for incidents, lost & found, complaints
- **Categories:** Transport type, station/stop, incident description

## Navigation Patterns

**Primary Nav Bar:** Reisesøk | Trafikkstatus | Logg inn | Planlegg reise | Om våre billetter | Skoleskyss | Få hjelp og kontakt | Om oss

**Common Internal Links:**
- Section headers link to overview pages
- Call-to-action buttons link to external subdomains (reise.ruter.no, minside.ruter.no)
- Footer contains links to organizational info, privacy, cookies, accessibility
- Breadcrumbs appear on detail pages (e.g., Om våre billetter > Enkeltbillett)

## Content Management
- **CMS:** Sanity
- **Static Generation:** Astro builds static HTML pages; dynamic content (status, routing) loads from APIs at runtime
