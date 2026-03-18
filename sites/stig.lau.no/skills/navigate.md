# Skill: Navigate the Blog

## Overview
This blog is a simple read-only archive with posts organized by date and label. Navigation is straightforward: use the home page, sidebar archives, or label filters to find posts.

## Home Page
**URL:** `https://stig.lau.no/`

- Displays the most recent posts in reverse chronological order
- Right sidebar shows:
  - **About Me** section (if present)
  - **Blog Archive** expandable tree (click year to see months/posts)
  - **Labels** as clickable links

## Finding Posts by Date

### Recent Posts
1. Go to home (`https://stig.lau.no/`)
2. Scroll to see post titles, dates, and snippets
3. Click any post title to open full post

### Browse by Year/Month
1. Home → Right sidebar → "Blog Archive"
2. Click a year (e.g., "▼ 2011") to expand
3. See posts grouped under months
4. Click a post to view
5. Or click the year itself (e.g., `https://stig.lau.no/2011/`) to see all posts in that year

## Finding Posts by Label

1. Home → Right sidebar → **Labels** section
2. See tags like "Apartment", "Architecture", "balcony", "Oslo", etc.
3. Click a label to filter posts with that tag
4. URL becomes: `https://stig.lau.no/search/label/<label-name>`
5. Results show all posts tagged with that label
6. Click any post to open full view

**Example Labels:**
- `Apartment` — posts about apartments
- `Architecture` — architecture discussions
- `Oslo` — Oslo/property-related posts
- `balcony` — posts mentioning balconies
- `3 room` — posts about 3-room apartments
- `Idea` — general ideas/thoughts

## Reading a Post

1. Click post title from home or search results
2. URL becomes: `https://stig.lau.no/YYYY/MM/post-slug.html`
3. Full post displays with:
   - Title
   - Date and author (Stig)
   - Post body (HTML content, may include embedded links/images)
   - Labels applied to the post (clickable)
   - Comments section (read-only; no posting)
   - "Newer Post" / "Older Post" navigation links
4. External links in the post are clickable (e.g., to finn.no, lagerboks.no)

## Navigation Between Posts

- **Older Post** link → go to previous (chronologically earlier) post
- **Newer Post** link → go to next (chronologically later) post
- **Home** link → return to blog home

## URL Patterns

| Purpose | Pattern | Example |
|---------|---------|----------|
| Home | `/` | `https://stig.lau.no/` |
| Post | `/YYYY/MM/slug.html` | `https://stig.lau.no/2011/07/software-engineering-approach-to.html` |
| Year archive | `/YYYY/` | `https://stig.lau.no/2011/` |
| Label search | `/search/label/<label>` | `https://stig.lau.no/search/label/Apartment` |
| Sitemap | `/sitemap.xml` | `https://stig.lau.no/sitemap.xml` |
| RSS feeds | `/feeds/posts/default` | `https://stig.lau.no/feeds/posts/default` |

## Tips

- Use the **Blog Archive** in the sidebar for quick date-based browsing
- Use **Labels** in the sidebar to find posts about specific topics
- Post titles are usually descriptive; scan them to find content of interest
- This blog is inactive; most recent posts are from 2011, with older posts from 2009
- Comments on posts cannot be posted by you (read-only)

## Expected Challenges

- **Few posts:** Only 2–3 substantive posts; blog is semi-abandoned
- **Sparse labels:** Not all posts are labeled; some labels appear to apply to only one post
- **External links:** Posts link to external sites (finn.no, lagerboks.no); these are not under your control
- **No search box:** Blogger's search function is disabled (robots.txt disallows `/search`); use label filters instead
