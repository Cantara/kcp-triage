# stig.lau.no — CLAUDE.md

## Site Identity

**Domain:** stig.lau.no  
**Title:** What's next  
**Type:** Personal blog (Blogger-hosted)  
**Author:** Stig Lau  
**Topics:** Software engineering, real estate marketing, technology  
**Status:** Low-activity personal blog; posts dating back to 2009, last activity in 2011

## Interaction Model

**Read-only personal blog.** No user authentication, no account creation, no data submission (beyond optional comment posting on blog posts).

## Allowed Operations

### ✅ Always Allowed
- Browse blog homepage and individual post pages
- Navigate blog archive by year (`/2011/`, `/2009/`, etc.)
- Filter posts by label/tag (e.g., `/search/label/Architecture`)
- Read post content, headings, and metadata (author, timestamp)
- View related links and external references within posts
- Access post comment sections and comment metadata

### ⚠️ With User Authorization (Optional, Not Required)
- Post comments on blog posts (requires filling form and submitting)
- Use Blogger's share buttons (Email This, BlogThis!, Share to X/Facebook/Pinterest) — these are external actions; agent may identify them but should not trigger them

### ❌ Never Do
- Attempt to edit or delete posts (admin-only via Blogger dashboard)
- Access `/search` path (disallowed by robots.txt for non-Mediapartners-Google agents)
- Modify or interact with `/share-widget` (disallowed by robots.txt)
- Impersonate the author or bypass access controls
- Scrape at high velocity; respect Blogger's standard crawl-delay

## Navigation

### URL Patterns
- **Homepage:** `https://stig.lau.no/`
- **Individual post:** `https://stig.lau.no/YYYY/MM/post-slug.html`
- **Archive by year:** `https://stig.lau.no/YYYY/` (e.g., `/2011/`)
- **Filter by label:** `https://stig.lau.no/search/label/LABEL` (e.g., `/search/label/Architecture`)
- **Atom feeds:** `https://stig.lau.no/feeds/POSTID/comments/default`

### Key Entry Points
- Homepage with recent posts and archive sidebar
- Post archive accessible via collapsible year selector (e.g., "▼ 2011")
- Label/tag cloud for filtered browsing
- Author profile link (`Stig` linked to Blogger profile)

## Tech Stack

- **Platform:** Google Blogger (blogger.com)
- **Hosting:** Blogger (Google)
- **Monetization:** Google AdSense
- **APIs:** Google APIs (gapi.iframes), Blogger comment frames
- **Feed:** Atom (post and comment feeds available)

## Rate Limiting & Crawl Etiquette

**robots.txt rules:**
- `Disallow: /search` for generic user-agent (but label pages at `/search/label/*` are crawlable)
- `Disallow: /share-widget`
- `Allow: /` (everything else permitted)
- Sitemap: `http://stig.lau.no/sitemap.xml`

Be polite: respect Blogger's standard crawl-delay; do not hammer the site with rapid requests.

## Available Skills

1. **navigate** — How to browse the blog, find posts, use the archive sidebar, and filter by labels
2. **read-post** — How to locate, load, and extract content from individual blog posts

## Security Notes

- Site has security grade **D** (missing HSTS and CSP headers)
- No sensitive user data expected on a read-only blog
- Comments section uses Blogger's iframe; exercise caution with user-generated content
