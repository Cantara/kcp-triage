# Skill: Check Traffic Status on Ruter.no

## Overview
Ruter.no provides real-time service disruption, delay, and alert information via the **Trafikkstatus** (Traffic Status) page. This skill covers how to find and interpret current service conditions.

## Accessing Traffic Status

### Method 1: From Navigation
1. Click **"Trafikkstatus"** in the top navigation bar
2. You are taken to https://ruter.no/trafikkstatus

### Method 2: From Homepage
1. Visit https://ruter.no/
2. Look for the **"Trafikkstatus"** section (often highlighted if there are disruptions)
3. Click **"Se trafikkstatus"** (See traffic status)

### Method 3: Direct Access
1. Visit https://ruter.no/trafikkstatus directly

## Reading the Status Page

### Status Summary
The page displays:
- **Current time** (updated automatically)
- **Active disruptions** (if any)
  - Number of affected services
  - Visual indicator (green = normal, yellow = delays, red = major disruption)

### Disruption Cards
Each disruption shows:
- **Transport type icon** (🚌 Bus, 🚇 Metro, 🚊 Tram, ⛴ Boat)
- **Line name/number** (e.g., "Metro L1", "Tram 12", "Bus 37")
- **Status label**:
  - "On time" (✓)
  - "Delayed" (with minutes, e.g., "Delayed 5-10 min")
  - "Cancelled" (⛔)
  - "Disruption" or "Planned maintenance"
- **Start time** when disruption began
- **Expected duration** (if known)
- **Brief description** of the issue

### Filtering by Transport Type
Use tabs or filters at the top to view:
- **All services** (default)
- **🚌 Buses** only
- **🚇 Metro (T-bane)** only
- **🚊 Trams (Trikk)** only
- **⛴ Boats (Ferge)** only

## Understanding Disruption Types

### Delays
- **Minor:** 1-5 minutes
- **Moderate:** 5-15 minutes
- **Severe:** 15+ minutes
- **Cause:** Traffic congestion, technical issues, staffing, weather
- **Impact:** Service runs but later than scheduled; extra wait at stops

### Cancellations
- **Label:** "Cancelled" or "Avlyst"
- **Impact:** Service does not run; passengers must use alternative routes
- **Typical causes:** Vehicle breakdown, major accidents, infrastructure damage
- **Duration:** Often a few minutes to several hours

### Planned Maintenance
- **Label:** "Planned disruption" or "Planlagt avvik"
- **Advance notice:** Announced days/weeks in advance
- **Impact:** Specific lines or sections not operating during specified times
- **Examples:** Rail upgrades (T-bane), track maintenance, station renovations
- **Typical times:** Weekends, off-peak hours, overnight

### Service Adjustments
- **Label:** "Modified schedule" or "Endret rute"
- **Impact:** Temporary route changes, fewer vehicles, altered stops
- **Causes:** Construction, events, staffing

## Detailed Information

### Click to Expand
- Tap/click on a disruption card to expand and see:
  - **Full description** of the issue
  - **Affected stops/stations** (sometimes)
  - **Recommended alternatives** (often)
  - **Expected resolution time** (if available)
  - **Link to more info** (sometimes points to project page, e.g., T-baneløftet)

## Real-Time Updates During Journey

### In Journey Planner (reise.ruter.no)
- When you search for a trip, each suggested journey shows **status indicators**:
  - Green leg = on time
  - Yellow leg = delayed (tap for details)
  - Red leg = disrupted/cancelled (passenger must choose alternative)

### On Departure Board
- Visit https://reise.ruter.no/?tab=__departures__&departures=true
- Each departing vehicle shows:
  - Scheduled time
  - **Real-time departure time** (if delayed, shows red or yellow)
  - Expected delay (e.g., "+5 min")

## Special Cases

### Major Disruptions
- **T-baneløftet (T-bane Upgrade Project)**
  - Large multi-year project (2024-2026)
  - Causes planned closures of metro sections
  - Replacement buses (buss for tog, "BFT") provided
  - Full info: https://ruter.no/prosjekter-og-nyutvikling/det-store-t-baneloftet

### Planned Route Changes
- Check https://ruter.no/nyheter (News) for announcements
- Example: New bus routes, tram reroutes, schedule adjustments

### Weather-Related Disruptions
- Winter snow/ice can cause:
  - Delays across all services
  - Increased frequency on certain routes
  - Cancellation of express services
- Check status page or app for updates

## Using Traffic Status in Trip Planning

1. **Check before recommending a journey:**
   - "Let me check current status first..."
   - Visit trafikkstatus page
   - Verify all legs of suggested journey are on-time

2. **If disruption on primary route:**
   - Note the disruption
   - Go to journey planner (reise.ruter.no)
   - Query again; system will suggest alternatives
   - Show alternative route to user

3. **If major disruption (metro line closed):**
   - Inform user of disruption and estimated duration
   - Check for replacement bus service (BFT)
   - Suggest waiting or using alternative metro line if available

## Notifications & Updates

### Ruter App
- Users can enable **push notifications** for specific lines/stops
- Automatic alerts when delays or disruptions occur
- Download: https://ruter.no/planlegg-reise/ruter-appen

### Website Auto-Refresh
- Trafikkstatus page **auto-updates** every 30-60 seconds
- No manual refresh needed
- Timestamps show when status was last updated

## Limitations & Caveats

1. **Real-time data lag** — Updates may be 1-2 minutes behind actual events
2. **Operator reporting delay** — Not all operators update instantly; some minor delays go unreported
3. **Planned disruptions only** — Unplanned events (accidents, sudden breakdowns) may not appear immediately
4. **Weekend/holiday changes** — Service levels may differ; schedule adjustments displayed in journey planner more accurately
5. **English language** — Main site is in Norwegian (Bokmål); some disruption descriptions may be in Norwegian
