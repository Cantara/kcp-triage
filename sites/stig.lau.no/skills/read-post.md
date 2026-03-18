# Skill: Read a Blog Post

## Overview
This skill covers how to locate, load, and extract content from an individual blog post on stig.lau.no.

## Prerequisites
- Access to a post URL (e.g., `https://stig.lau.no/2011/08/moved-to-bloggercom.html`)
- No authentication required

## Steps

### 1. Load the Post Page
**Action:** Navigate to the post URL or click a post title from the homepage.

**Expected outcome:**
- Page loads with post title and date
- URL follows pattern: `https://stig.lau.no/{YYYY}/{MM}/{post-slug}.html`
- Browser tab title: "What's next: {POST TITLE}" (e.g., "What's next: Moved to blogger.com")

### 2. Extract Post Metadata
**Action:** Look for the following elements on the page:

| Element | Location | Example |
|---------|----------|----------|
| Post Title | H3 | "Moved to blogger.com" |
| Date | H2 above title | "Sunday, August 7, 2011" |
| Author | Link with text "Stig" | https://www.blogger.com/profile/17732976186109189576 |
| Timestamp | Link below author | "8:57 AM" |
| Blog Title | H1 (top of page) | "What's next" |

### 3. Extract Post Content
**Action:** Locate the main post body (between the metadata and comment section).

**Expected outcome:**
- HTML structure may include:
  - Paragraphs (`<p>`)
  - Headings (`<h2>`, `<h3>`)
  - Links to external sites (e.g., http://www.finn.no)
  - Embedded images or images from WordPress files (e.g., stigl.files.wordpress.com)
  - Blockquotes or formatted text

**Example from "A software engineering approach to marketing real-estate":**
- Includes sections: "Introduction", "Problem elaboration"
- References external sites (lagerboks.no, finn.no)
- Contains discussion of real-estate marketing and software engineering concepts

### 4. Extract Links and References
**Action:** Scan post content for external links (outside stig.lau.no).

**Expected outcome:**
- Links typically point to:
  - Real-estate sites (finn.no, lagerboks.no)
  - Search results (google.no, google.com)
  - Ad platforms (adwords.google.com)
  - External projects (e.g., leilighet.kompo.st)

**Example:**
```
http://www.lagerboks.no
http://www.finn.no/finn/realestate/object?finnkode=29738339
http://leilighet.kompo.st
```

### 5. View Comments Section
**Action:** Scroll to the bottom of the post.

**Expected outcome:**
- Comment count displayed (e.g., "No comments:", "1 comment:")
- Comment form visible with text "Post a Comment"
- If comments exist, they are listed with:
  - Commenter name
  - Timestamp
  - Comment text
- Atom feed link for comments: `https://stig.lau.no/feeds/{POSTID}/comments/default`

### 6. Navigate to Adjacent Posts
**Action:** Look for navigation links at the bottom of the post.

**Expected outcome:**
- "Newer Post" link (if a more recent post exists)
- "Older Post" link (if an older post exists)
- "Home" link (returns to homepage)

**Example:**
- Post: /2011/08/moved-to-bloggercom.html
- Older Post: /2011/07/software-engineering-approach-to.html
- Newer Post: (none, if this is the latest)

## Common Content Patterns

### Software Engineering Posts
- Title: "Open Sourcing the Business Model"
- Sections: "How business processes are perceived", "What's to change"
- References to business/tech concepts

### Real-Estate Posts
- Title: "A software engineering approach to marketing real-estate"
- Sections: "Introduction", "Problem elaboration"
- External links to Finnish real-estate sites (Finn.no)
- References to property listings and marketing tactics

## Tips
- Post content may include images from external hosts (e.g., stigl.files.wordpress.com)
- URLs in post may be outdated (blog dates back to 2009–2011)
- Comments section uses Blogger's iframe; user-generated content may vary in relevance
- Author profile link points to public Blogger profile (no private data)

## Limitations
- Posts are read-only; cannot edit or delete
- Comments require filling a form; optional
- No direct post metadata API; information extracted from HTML
