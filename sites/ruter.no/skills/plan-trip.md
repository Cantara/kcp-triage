# Skill: Plan a Trip on Ruter.no

## Overview
Ruter.no provides journey planning via the **Reisesøk** tool at https://reise.ruter.no/ — a separate interactive SPA (Single Page Application) for querying routes, schedules, and real-time travel information across Oslo and Akershus public transit.

## Accessing the Journey Planner

### Method 1: From Navigation
1. Click **"Reisesøk"** in the top navigation bar
2. You are taken to https://reise.ruter.no/

### Method 2: From Homepage
1. Visit https://ruter.no/
2. Look for the large search box "Hvor vil du reise?" (Where do you want to travel?)
3. This input field is linked to the journey planner

### Method 3: Direct Access
1. Visit https://reise.ruter.no/ directly in your browser

## Using the Journey Planner

### Basic Trip Search

**Step 1: Enter departure point**
- Type the **starting address, station name, or stop name** in the "From" field
- Examples: "Hauptbahnhof", "Østbanehallen", "Storgata 1, Oslo"
- The planner will suggest matching stops and addresses
- Select from dropdown suggestions

**Step 2: Enter destination**
- Type the **destination address, station name, or stop name** in the "To" field
- Same autocomplete behavior as departure field
- Select from suggestions

**Step 3: Set time preferences**
- **Depart time:** Choose departure time (default is "now")
  - Tap to open time picker
  - Set hour and minute
- **Date:** Choose travel date (default is today)
  - Tap to open date picker
  - Select date from calendar
- **Advanced:** Some versions allow "Arrive by" mode instead of "Depart at"

**Step 4: Set preferences (optional)**
- **Accessibility filters:** Walking distance, wheelchair access, step-free boarding
- **Transport mode preferences:** Exclude certain transport types (e.g., "No metro" if preferred)
- **Number of transfers:** Maximum number of transfers tolerated

**Step 5: Search**
- Tap **"Planlegg reise"** or **Search** button
- System queries Ruter's route database and real-time data

## Understanding Results

### Journey Suggestions
The planner returns multiple **suggested journeys** ranked by:
1. Travel time
2. Number of transfers
3. Arrival time

Each suggestion shows:
- **Departure & arrival times** (including walking time to/from stops)
- **Transport modes** (bus icon 🚌, metro icon 🚇, tram icon 🚊, boat icon ⛴)
- **Line numbers** (e.g., "Metro L1", "Bus 37")
- **Stops/stations** where transfers occur
- **Real-time status** (on-time, delayed, or disrupted)
- **Price indicator** (if available for single journey)
- **Duration** (total travel time)

### Interpreting Leg Details
Click on a suggested journey to expand and see:
- **Detailed leg-by-leg breakdown:**
  - Leg 1: Walk from start to first stop (time)
  - Leg 2: First bus/metro ride (line, direction, duration, stops)
  - Leg 3: Transfer walk (time between stops)
  - Leg 4: Second bus/metro ride
  - Final leg: Walk from last stop to destination
- **Real-time updates:** "On time", "Delayed 5 min", "Cancelled"
- **Accessibility info:** "Wheelchair accessible", "Audio announcements", etc.
- **Seat availability:** If real-time data available

## Departure Board

### Quick Departures View
- Click **"Se avganger"** (See departures) on homepage
- Opens https://reise.ruter.no/?tab=__departures__&departures=true
- Shows **live departures** from a selected stop:
  - Enter stop name (e.g., "Stortinget", "National Theatre")
  - See all buses/metros/trams leaving in next 30-60 minutes
  - Includes real-time delays and vehicle info

## Traffic Status

### Within Journey Planner
- Journey results show real-time status for each leg
- Green = on time, Yellow = delayed, Red = major disruption/cancelled
- Tap status icon for details

### Full Status Page
- Visit https://ruter.no/trafikkstatus from main site
- See all current disruptions by transport type
- Filter by: Bus, Metro, Tram, Boat
- Read impact description and expected duration

## Special Cases

### Multi-Modal Journeys
- Planner automatically combines bus, metro, tram, and boat legs
- Walking transfers between stops are included in time estimates
- Real-time updates apply to all legs

### Accessibility Requirements
- If you have mobility restrictions:
  1. Look for **accessibility filter** in search options
  2. Enable "Wheelchair accessible" or "Minimal stairs"
  3. Planner returns only routes with accessible vehicles and stops

### Late Night / Rare Schedules
- Oslo/Akershus have different service levels at night
- Set departure time for late night hours (e.g., 23:45)
- Planner shows night buses and reduced metro service (if applicable)

### Using the Ruter App
- Mobile app (iOS/Android) offers same features plus:
  - Offline mode
  - Saved favorite stops
  - Push notifications for service alerts
  - Ticket purchase integration
- Download links: https://ruter.no/planlegg-reise/ruter-appen

## Tips for Effective Trip Planning

1. **Start with specific stop names** — "Oslo Central Station" is better than "downtown"
2. **Check traffic status first** — Before recommending a journey, verify no major disruptions
3. **Plan with buffer time** — Real-time delays can occur; suggest arriving 5-10 min early
4. **Consider alternatives** — If journey takes many transfers, suggest walking or waiting for next direct service
5. **Ticket timing** — Note that single tickets (enkeltbillett) are valid for 60 min with transfers
6. **Late hours** — Night service (24-26) is limited; some routes don't run after midnight
7. **Weekends** — Reduced frequency on weekends for some routes; check planner for accurate times

## Common Stops & Stations (Reference)

### Metro Terminals
- **Tøyen** (end of some lines)
- **Storbrand/Grorud** (other lines)
- **Majorstuen** (interchange, currently under renovation as of 2024-2026)
- **Stortinget** (central station)
- **Oslo S** (Oslo Central Station)

### Major Bus Hubs
- **Oslo Bus Terminal** (Bussterminalen)
- **Spektrum** (major bus stop)
- **Gardermoen Airport** (airport bus hub)

### Tourist/Landmark Stops
- **Vigelandsparken** (sculpture park)
- **Frogner Park**
- **City Hall (Rådhuset)**
- **National Museum**

## Limitations & Caveats

1. **The planner tool is external** — https://reise.ruter.no/ is a separate SPA; may have different terms/policies
2. **Real-time data dependency** — Accuracy depends on live feeds from operators (may lag 1-2 min)
3. **Future journeys** — You can plan up to ~30-90 days ahead depending on schedule publication
4. **Network connectivity required** — Journey planner needs internet; offline mode available in app only
5. **No ticket booking** — Planner shows routes; actual ticket purchase happens separately (app, physical card, on-board)
