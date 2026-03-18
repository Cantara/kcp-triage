# Skill: Navigate stig.lau.no

## Overview
This skill covers how to browse the blog, locate posts, use the archive sidebar, and filter by labels.

## Prerequisites
- Browser access to https://stig.lau.no/
- No authentication required

## Steps

### 1. Access the Homepage
**Action:** Load `https://stig.lau.no/`

**Expected outcome:**
- Page title: "What's next"
- Main heading: "What's next" (H1)
- Recent blog posts displayed in reverse chronological order
- Sidebar with archive and labels

### 2. Browse Recent Posts
**Action:** Scroll down the homepage or look for post titles (e.g., "Moved to blogger.com", "A software engineering approach to marketing real-estate")

**Expected outcome:**
- Each post shows:
  - Post title (H3)
  - Date (H2, e.g., "Monday, July 18, 2011")
  - Snippet of content
  - Author link ("Stig")
  - Timestamp link (e.g., "8:57 AM")
  - Comment count (e.g., "No comments:", "1 comment:")
  - Share buttons (Email This, BlogThis!, etc.)

### 3. Navigate by Year (Archive Sidebar)
**Action:** Locate the collapsible year selector in the sidebar (e.g., "▼ 2011"). Click the year to expand/collapse posts from that year.

**Expected outcome:**
- Year collapses/expands to show posts from that year
- Posts listed with dates
- Example: expanding "2011" shows "Sunday, August 7, 2011" and "Monday, July 18, 2011"

### 4. Filter by Label
**Action:** Navigate to a label page by:
- Visiting `https://stig.lau.no/search/label/{LABEL}` (e.g., `/search/label/Architecture`), or
- Clicking a label from the labels cloud (if visible on sidebar)

**Expected outcome:**
- Page title: "What's next: {LABEL}" (e.g., "What's next: Architecture")
- Posts tagged with that label displayed
- "Show all posts" link visible to return to homepage

### 5. Access an Individual Post
**Action:** Click a post title or timestamp link (e.g., "Moved to blogger.com" or "8:57 AM")

**Expected outcome:**
- Navigate to `/{YYYY}/{MM}/{post-slug}.html`
- Full post content displayed
- Comment section visible
- "Newer Post" and "Older Post" navigation links appear

## Common Labels
- Architecture
- Apartment
- 3 room
- balcony
- Oslo
- Idea

## Tips
- Posts are in reverse chronological order (newest first)
- Blog is low-activity; most posts from 2011 and earlier
- Archive sidebar allows quick jump to specific years
- Labels help filter posts by topic
- No search box present; use label or date-based navigation

## Limitations
- `/search` path is disallowed for non-Mediapartners-Google agents (per robots.txt), but `/search/label/*` is permitted
- No full-text search available on the site
