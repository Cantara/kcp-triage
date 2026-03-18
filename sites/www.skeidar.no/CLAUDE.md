# Skeidar.no – LLM Agent Orientation

## Site Identity
**Domain:** www.skeidar.no  
**Title:** Møbler - Norsk design og moderne interiør hos Skeidar  
**What it is:** Norway's largest furniture and interior design e-commerce retailer, operating since 1912. Sells sofas, beds, mattresses, dining furniture, home décor, and outdoor furniture online with Norwegian delivery.

## Interaction Model
**Type:** Authenticated e-commerce  
The site requires user sessions for cart, checkout, and account features. No explicit API key or OAuth detected for end-user operations. Session-based authentication is used for shopping workflows.

## Allowed Operations

### Always Allowed (No auth required)
- **Browsing:** Homepage, all product listing pages, category pages, campaign/sale pages
- **Searching & filtering:** By brand, category, stock status, price, sale status
- **Reading:** Customer service pages (contact, FAQ, price guarantee, comfort guarantee, financing info)
- **Navigation:** Store locator (Google Maps), social links

### With User Authorization (Agent may do when explicitly instructed by user)
- **Add to cart:** Select product, choose options (color, size, quantity), add to cart
- **Initiate checkout:** View cart, proceed to checkout flow
- **Account login:** Access order history, wishlist (if user provides credentials)

### Never Do
- **Complete payment:** Stop before payment submission. Hand off to human user.
- **Delete data:** User accounts, orders, wishlist items
- **Bypass authentication:** Do not attempt to access /account/, /orders, /checkout, /cart, /wishlist, /login without user consent
- **Modify personal data:** Orders, addresses, payment methods

## Navigation & URL Patterns

**Homepage:** `/`  
**Product browsing:**
- `/alle-produkter/` – All products with filters (brand, category, stock, sale)
- `/alle-produkter/?filter=<filters>&sort=<sort>&page=<page>` – Filtered product pages
- Category examples: `/alle-produkter/alle-hagemobler-og-uterom/utesofa/`, `/hagemobler/`

**Campaigns/Sales:**
- `/ukens-kampanjer/` – Weekly campaigns
- `/ukens-kampanjer/alltid-lav-pris/` – "Always Low Price" campaign
- `/ukens-kampanjer/beste-kupp/` – "Best Deals" campaign

**Customer Service:**
- `/kundeservice/` – Main customer service hub
- `/kundeservice/kontakt/` – Contact page with store locator
- `/kundeservice/ordre-og-kjop/` – Orders and purchases
- `/kundeservice/betaling-og-fakturering/` – Payment and billing
- `/kundeservice/levering-og-frakt/` – Shipping and freight
- `/kundeservice/retur-og-reklamasjon/` – Returns and complaints
- `/kundeservice/prislofte/` – Price guarantee
- `/kundeservice/komfortgaranti/` – 100-day mattress trial
- `/kundeservice/finansiering/` – Financing options

**Blocked by robots.txt (user-only areas):**
- `/cart/`, `/checkout/`, `/account/`, `/customer/`, `/login`, `/logout`, `/orders`, `/wishlist/`, `/compare/`, `/kjop-og-hent/`, `/search`

## Tech Stack
- **Frontend:** JavaScript, responsive web design
- **Analytics:** Google Tag Manager (GTM-WPCV33)
- **Maps:** Google Maps API (store locator)
- **Backend:** Appears to be Episerver CMS (inferred from `/episerver/` block in robots.txt)
- **E-commerce:** Native platform with cart/checkout system

## Rate Limiting & Crawl Behavior
**robots.txt crawl-delay:** Not explicitly set, but `/Disallow` rules suggest respecting standard 1-2 second delays.  
**Blocked parameters:** `utm_*`, `gclid`, `fbclid` to avoid duplicate crawl  
**Be polite:** Respect crawl-delay, avoid hammering pagination or search endpoints.

## APIs & Integrations
See `apis/` directory for detailed endpoints. Key integrations:
- **Google Tag Manager:** E-commerce event tracking (GTM-WPCV33)
- **Google Maps API:** Store locator on `/kundeservice/kontakt/`
- **No public REST API detected** – e-commerce operations appear frontend-driven via session cookies

## Available Skills
Each skill below corresponds to a focused how-to document in the `skills/` directory:
1. **navigate** – How to browse categories, search filters, and find product pages
2. **order-flow** – Complete purchasing workflow: browse → select → add to cart → checkout (stops before payment)
3. **campaigns-and-deals** – How to find sales, weekly campaigns, and the "Always Low Price" guarantee
4. **customer-service** – Accessing contact info, FAQs, returns/complaints, and financing

## Security Note
**Grade: F** (per audit — see `security-report.md` for full details)

Critical issues:
- **No HSTS** — vulnerable to MITM/SSL stripping attacks
- **No CSP** — no defense against XSS or supply chain script injection
- **Cookie bomb** — `cuid` cookie set 13× per response (performance/DoS vector)
- **Exposed API keys** — Google Maps, LipScore, Azure instrumentation in page source
- **No visible CSRF tokens** — state-changing forms may lack CSRF protection
- **Infrastructure leakage** — Episerver, ASP.NET, Azure, Cloudflare all identifiable

Additional: missing X-Content-Type-Options, anonymous tracking cookie before consent (GDPR concern), `/find_v2/` endpoint exposed, canonical URL double-protocol bug.

Agents operating on this site should be aware of the weak security posture — do not trust that session isolation or transport security is properly enforced.

## Interaction Constraints
- **No direct API calls** for shopping operations detected; all e-commerce flows use form submissions and browser sessions
- **Session cookies required** for cart/checkout
- **User must authorize** any cart or account operations
- **Agent must stop before payment** and inform user that human review is required
