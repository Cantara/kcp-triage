The site does not expose a machine-readable API. However, Blogger-hosted blogs typically support:

1. **Atom/RSS Feeds** (inferred, confidence: medium)
   - Evidence: Crawl data shows `/feeds/posts/default` pattern in links; typical Blogger feature
   - Suspected URLs: `https://stig.lau.no/feeds/posts/default` (all posts), `https://stig.lau.no/feeds/4036860925297400748/comments/default` (per-post comments)
   - Verification: Attempt a GET on these URLs; should return Atom XML with post/comment metadata

2. **Blogger REST API** (inferred, confidence: low)
   - Evidence: Blogger platform supports official REST API via Google APIs, but this requires OAuth authentication and blogger ID
   - Note: This blog does not appear to expose its API publicly; would require blogger authentication
   - Verification: Check if `https://www.googleapis.com/blogger/v3/blogs/5771956397849057923/posts` (blog ID visible in admin links) returns data; likely requires auth token

3. **Comment submission via iFrame** (inferred, confidence: medium)
   - Evidence: Crawl shows `https://www.blogger.com/comment/frame/...` iFrame URLs in post pages
   - Note: These are read-only in the crawl; actual comment posting would require in-browser interaction or session/cookie handling
   - Verification: Inspect network tab in browser when attempting to post a comment; see if there's a form POST to `blogger.com/comment/`

**Recommendation:** For this simple blog, no API integration is necessary. Treat it as a read-only HTML scraping target using standard HTTP requests to post URLs and label filters. If you need post metadata in machine-readable form, try the Atom feeds.