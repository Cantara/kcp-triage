# Ruter.no Site Guide

## Identity
**Domain:** ruter.no  
**Organization:** Ruter AS (publicly owned public transit authority)  
**Service:** Official public transit portal for Oslo and Akershus, Norway  
**Primary Purpose:** Information, journey planning, and service portal for bus, metro, tram, and boat services

## Interaction Model
**Read-only** with optional authentication portal (minside.ruter.no)

Ruter.no is primarily an **informational and service discovery site**. It provides trip planning, real-time status, ticket information, and help resources. While tickets can be purchased through the Ruter app or third-party channels, the main site itself does not process payments.

## Allowed Operations

### Always Allowed (No Auth Required)
- Browsing site content (routes, fares, schedules)
- Searching for trips via reise.ruter.no subdomain (journey planner)
- Checking real-time traffic status and service disruptions
- Reading help articles and contact information
- Downloading route maps and tourist information
- Accessing school transport (skoleskyss) information
- Viewing T-bane upgrade project details

### With User Authorization (When Instructed)
- Logging into minside.ruter.no (user account portal)
- Managing personal travel saved journeys or preferences
- Accessing school transport application portals for Oslo/Akershus

### Never Do
- Complete ticket purchases or payment transactions
- Delete user accounts or personal data
- Bypass authentication on minside.ruter.no
- Submit actual complaints or support tickets without explicit user approval
- Access administrative or internal system functions

## Navigation

**Key Entry Points:**
- **Home:** https://ruter.no/
- **Journey Planner:** https://reise.ruter.no/ (separate SPA subdomain)
- **Traffic Status:** https://ruter.no/trafikkstatus
- **Plan Trip Hub:** https://ruter.no/planlegg-reise
- **Tickets & Fares:** https://ruter.no/om-vare-billetter
- **School Transport:** https://ruter.no/skoleskyss
- **Help & Contact:** https://ruter.no/fa-hjelp-og-kontakt
- **About Ruter:** https://ruter.no/om-oss
- **User Account Portal:** https://minside.ruter.no/ (separate domain)

**URL Patterns:**
- Main site: `/` root with top-level sections
- Content pages: `/[section]/[page]` (e.g., `/om-vare-billetter/enkeltbillett`)
- News/updates: `/nyheter/[slug]`
- Projects: `/prosjekter-og-nyutvikling/[project]`
- Subdomains: `reise.ruter.no` (journey planner), `minside.ruter.no` (user portal), `kontakt.ruter.no` (contact form)

## Tech Stack
- **Framework:** Astro (static site framework with View Transitions API)
- **CMS:** Sanity CMS (headless content management)
- **Architecture:** Server-side rendered with client-side enhancements

## Rate Limiting & Politeness
- **robots.txt crawl-delay:** 1 second
- **Allowed:** `/` (all pages indexed)
- **Disallowed:** `/sok?` (search query strings)
- **Sitemap:** https://ruter.no/sitemap.xml

Respect the 1-second crawl delay. Avoid hammering reise.ruter.no journey planner with rapid requests.

## APIs & Data Sources

No public REST APIs are explicitly documented on ruter.no. However:

- **reise.ruter.no** (journey planner SPA) likely has backend APIs for route/schedule queries — inferred via network inspection
- **minside.ruter.no** (user portal) likely has authentication and user management APIs — inferred
- **kontakt.ruter.no** (contact form subdomain) likely submits to a backend contact/ticketing system

See **apis/** directory for details on inferred endpoints.

## Available Skills
- `navigate` — Finding content and sections on ruter.no
- `plan-trip` — Using the journey planner (reise.ruter.no) to search routes, interpret results, and understand travel options
- `check-traffic-status` — Reading real-time disruptions and service alerts
- `understand-tickets` — Navigating ticket types, prices, and purchasing channels
- `explore-school-transport` — Finding skoleskyss eligibility and application portals
