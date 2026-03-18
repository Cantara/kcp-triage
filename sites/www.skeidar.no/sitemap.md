# Skeidar.no – Site Structure & Navigation

## Main Sections

### Homepage & Navigation
- **Home:** `/` – Main landing page with featured categories, campaigns, and promotions

### Product Catalog
- **All Products:** `/alle-produkter/` – Master product listing with filters
  - **Filters available:** Brand, category, stock status (webshop/regional warehouse), sale status, price range
  - **Sorting:** By price, popularity, newest, etc.
  - **Pagination:** Pages numbered in query string (`?page=1`, `?page=2`, etc.)

### Product Categories
- **Sofas & Seating:** Stuer (living room), Stuer (sofas)
- **Beds & Mattresses:** Soverom (bedroom), Madrasser (mattresses)
- **Dining:** Spisestue (dining room), Spisegrupper (dining sets)
- **Home Decor & Lighting:** Belysning (lighting), Tepper & matter (rugs & mats), Dekoration
- **Outdoor/Garden:** `/hagemobler/` (outdoor furniture) with subsections:
  - `/alle-produkter/alle-hagemobler-og-uterom/utesofa/` (outdoor sofas)
  - `/alle-produkter/alle-hagemobler-og-uterom/hagespisegrupper/` (garden dining sets)
  - `/alle-produkter/alle-hagemobler-og-uterom/hagestoler-og-utebenker/` (garden chairs & benches)
  - `/alle-produkter/alle-hagemobler-og-uterom/hagebord/` (garden tables)
  - And more subsections (loungers, umbrellas, pavilions, etc.)

### Campaigns & Sales
- **Weekly Campaigns:** `/ukens-kampanjer/` (weekly offers hub)
  - `/ukens-kampanjer/alltid-lav-pris/` – "Always Low Price" permanent campaign
  - `/ukens-kampanjer/beste-kupp/` – "Best Deals" highlighted items

### Customer Service
- **Service Hub:** `/kundeservice/` – Central help & support pages
  - `/kundeservice/kontakt/` – Contact form, store locator (Google Maps), store phone numbers
  - `/kundeservice/ordre-og-kjop/` – Order & purchase FAQs
  - `/kundeservice/betaling-og-fakturering/` – Payment, invoicing, financing options
  - `/kundeservice/levering-og-frakt/` – Shipping, delivery times, free shipping threshold (5,000 NOK)
  - `/kundeservice/retur-og-reklamasjon/` – Returns, complaints, complaint form
  - `/kundeservice/prislofte/` – Price guarantee policy
  - `/kundeservice/komfortgaranti/` – 100-day mattress trial warranty
  - `/kundeservice/finansiering/` – Financing/payment plan options

## Blocked Areas (robots.txt)
- `/cart/` – Shopping cart (user session only)
- `/checkout/` – Checkout process (user session only)
- `/account/`, `/customer/` – User account pages
- `/login`, `/logout` – Authentication endpoints
- `/orders` – Order history (authenticated user only)
- `/wishlist/`, `/compare/` – Saved items (user session only)
- `/kjop-og-hent/` – Click & collect workflow
- `/search` – Search endpoint
- `/episerver/` – CMS admin panel
- `/util/` – Internal utilities

## Sitemap Files
- `productssitemap.xml` – Product catalog
- `roomssitemap.xml` – Room/category pages
- `storessitemap.xml` – Physical store locator
- `customerservicesitemap.xml` – Customer service pages

## URL Pattern Examples

**Filtered product pages:**
```
/alle-produkter/?filter=stock_status|WEBSHOP&sort=6&page=1
/alle-produkter/?filter=p_brand|Brunstad&sort=6&page=1
/alle-produkter/?filter=onsale|sale&sort=6&page=1
/alle-produkter/?filter=stock_status|WEBSHOP;category_name|Sofa&sort=6&page=1
```

**Brand pages:**
- Filter by brand name in query: `p_brand|BrandName`

**Stock filters:**
- `stock_status|WEBSHOP` – In stock at webshop
- `stock_status|REGIONALWAREHOUSE` – Available at regional warehouse (fast delivery)

**Sorting:**
- `sort=6` – Default sort (likely by popularity or newest)

## Navigation Flow (Typical User Journey)
1. Browse homepage `/`
2. Click category link or "All Products" → `/alle-produkter/`
3. Apply filters (brand, stock, price) → Filtered URL with query params
4. Click product card → Product detail page (URL pattern: `/alle-produkter/{category}/{product-name}/`)
5. Select options (color, size, quantity) on product page
6. Click "Add to cart" → Cart updated (session-based, no redirect unless checkout initiated)
7. View cart or proceed to checkout → `/checkout` (requires authentication or guest session)
8. Enter shipping & payment info → Agent stops here; user completes payment

## Key Entry Points for Agents
- **Start here:** `/` or `/alle-produkter/`
- **Campaigns:** `/ukens-kampanjer/`
- **Support:** `/kundeservice/`
- **Outdoor:** `/hagemobler/`
