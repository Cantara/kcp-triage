# What's next — stig.lau.no

**Identity:** A personal blog hosted on Blogger (blogspot platform), custom domain stig.lau.no. Authored by Stig Lau. Covers software engineering and real estate marketing topics with posts dating to 2009.

**Interaction Model:** Read-only. This is a classic blog with no interactive features, user accounts, or backend forms. You can browse posts, search by label, view archives, but cannot submit comments, edit content, or perform any write operations.

**Allowed Operations:**

- **Always allowed** — Browse the blog home, read individual posts, navigate by date (archives at `/YYYY/`), filter by label (`/search/label/<label>`), follow post links to external resources
- **Never do** — Attempt to post comments (would require authentication that is out of scope), access Blogger admin URLs (e.g., `blogger.com/post-edit.g`), interact with the sharing buttons beyond understanding their function

**Navigation:**

- **Home:** `https://stig.lau.no/` — displays recent posts and sidebar with archive/labels
- **Post URL pattern:** `https://stig.lau.no/YYYY/MM/post-slug.html`
- **Archive by year:** `https://stig.lau.no/YYYY/` (e.g., `/2011/`)
- **Filter by label:** `https://stig.lau.no/search/label/<label-name>` (e.g., `/search/label/Apartment`)
- **All labels discovered:** 3 room, Apartment, Architecture, balcony, Oslo, Idea

**Tech Stack:**

- Platform: Blogger (Google's hosted blogging service)
- Templates: Blogger default templates with Google iframes API for embedded elements
- Ads: Google AdSense
- Custom domain: stig.lau.no points to blogspot backend

**Security Note:**

The site has a critical issue: HTTP requests do not redirect to HTTPS (returns 200 instead of redirect). Always use `https://stig.lau.no` when accessing. The site lacks security headers (HSTS, CSP). This is a Blogger limitation, not configurable by the author.

**Rate Limiting:**

Robots.txt allows `/` with a disallow on `/search` and `/share-widget`. Respect a reasonable crawl-delay (2–5 seconds between requests). Sitemaps available at `/sitemap.xml`.

**Available Skills:**

- `navigate` — How to move through the blog, find posts by date or label, understand URL patterns
