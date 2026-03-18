# stig.lau.no — Sitemap

## Site Structure

### Homepage
- **URL:** `/`
- **Content:** Recent blog posts, archive sidebar, labels

### Blog Posts (Individual)
- **URL Pattern:** `/{YYYY}/{MM}/{post-slug}.html`
- **Example:** `/2011/08/moved-to-bloggercom.html`, `/2011/07/software-engineering-approach-to.html`
- **Content:** Full post text, author info, timestamp, comment section, share buttons

### Archive Pages
- **URL Pattern:** `/{YYYY}/` (e.g., `/2011/`, `/2009/`)
- **Content:** Posts from a specific year, collapsible sidebar

### Label/Tag Pages
- **URL Pattern:** `/search/label/{LABEL}` (e.g., `/search/label/Architecture`, `/search/label/Apartment`)
- **Content:** Posts tagged with that label, sorted by date
- **Available Labels:** 3 room, Apartment, Architecture, balcony, Oslo, Idea, and others

### Feeds
- **Post feed:** Via sitemap.xml or direct Atom links
- **Comment feed:** `/feeds/{POSTID}/comments/default`

## Navigation Flow

```
Homepage (/)
  ├─ Recent Posts
  │  └─ Individual Post (/{YYYY}/{MM}/{slug}.html)
  │     └─ Comments section
  ├─ Archive Sidebar
  │  └─ Year (e.g., ▼ 2011)
  │     └─ Monthly posts
  └─ Labels Cloud
     └─ Label Page (/search/label/{LABEL})
        └─ Posts with that tag
```

## Crawl Summary

- **Total pages crawled:** 20
- **Key posts identified:** 6 major posts from 2009–2011
- **Sitemap:** http://stig.lau.no/sitemap.xml
- **robots.txt:** Disallows `/search` (generic user-agent) and `/share-widget`; allows `/search/label/*`
