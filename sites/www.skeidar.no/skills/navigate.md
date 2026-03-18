# Skill: Navigate Skeidar Product Catalog

## Overview
This skill teaches how to browse Skeidar's furniture product catalog, apply filters, search categories, and locate specific products or deals.

## Prerequisites
None. Navigation requires no authentication.

## Step-by-Step Guide

### 1. Start at Homepage
**URL:** `https://www.skeidar.no/`

**What you'll see:**
- Featured product sections (sofas, beds, mattresses, lighting, rugs, home décor)
- Quick links to popular categories: "Rask levering" (fast delivery), "Alltid lav pris" (always low price)
- Weekly campaigns banner
- Navigation menu at top

**Next step:** Click "Alle produkter" (All Products) or a category link.

### 2. Access All Products Page
**URL:** `https://www.skeidar.no/alle-produkter/`

**What you'll see:**
- Grid of furniture products (sofas, beds, mattresses, etc.)
- Left sidebar with filter options
- Pagination at bottom

**Filters available:**
- **Brand** (Brunstad, Conform, Formfin, Furninova, Hjellegjerde, Jensen, Stressless, Svane, Wonderland, XOV, etc.)
- **Category** (Sofa, Seng, Madrass, Stolgrupper, Belysning, Tepper, etc.)
- **Stock Status:**
  - "Webshop" – In stock, ready to ship
  - "Rask levering" (fast delivery) – At regional warehouse, ships within days
- **Sale Status:**
  - "Onsale" – Items on sale/discount
- **Price Range** (slider)

**Sorting options:**
- Default (sort=6, appears to be popularity/newest)
- Price (low to high, high to low)
- Newest arrivals

### 3. Apply Filters
**Method 1: Click filter checkboxes**
- Check boxes on left sidebar (e.g., brand names, categories)
- Page updates with filtered results immediately
- URL updates with filter parameters (e.g., `?filter=p_brand|Brunstad`)

**Method 2: Use URL parameters directly**

Example filtered URLs:
```
https://www.skeidar.no/alle-produkter/?filter=stock_status|WEBSHOP&sort=6&page=1
https://www.skeidar.no/alle-produkter/?filter=p_brand|Jensen&sort=6&page=1
https://www.skeidar.no/alle-produkter/?filter=onsale|sale&sort=6&page=1
https://www.skeidar.no/alle-produkter/?filter=stock_status|REGIONALWAREHOUSE;stock_status|WEBSHOP&sort=6&page=1
```

**Common filter combinations:**
- `stock_status|WEBSHOP` – Only webshop-stocked items
- `stock_status|REGIONALWAREHOUSE` – Fast delivery items
- `p_brand|{BrandName}` – Specific brand
- `onsale|sale` – Sale items only
- `category_name|{CategoryName}` – Specific category (e.g., Sofa, Madrass)

### 4. Browse Filtered Results
**What you'll see:**
Product cards with:
- Product image
- Product name (clickable)
- Brand
- Price (current and original if on sale)
- Stock status ("Webshop", "Rask levering", or "Ikke på lager")
- Quick add-to-cart button (may require selection options)

**Navigation:**
- **Next page:** Click page number at bottom (e.g., "2", "3") or "Neste" (Next)
- **Previous page:** Click "Forrige" (Previous)
- **Change sort:** Use sort dropdown in top-right
- **Reset filters:** Click "Fjern alle filtre" (Clear all filters) or uncheck filter boxes

### 5. Navigate by Category
Direct category URLs (without filters):
- `/hagemobler/` – Outdoor furniture hub
- `/alle-produkter/alle-hagemobler-og-uterom/utesofa/` – Outdoor sofas
- `/alle-produkter/alle-hagemobler-og-uterom/hagespisegrupper/` – Garden dining sets

### 6. Search for Quick Deals
Campaign/sale pages:
- `/ukens-kampanjer/alltid-lav-pris/` – "Always Low Price" campaign (permanent)
- `/ukens-kampanjer/beste-kupp/` – "Best Deals" highlighted items
- `/ukens-kampanjer/` – All weekly campaigns

### 7. View Product Detail
**Action:** Click on any product card (image or name)

**Expected URL pattern:**
```
https://www.skeidar.no/alle-produkter/{category}/{product-name}/
```

**What you'll see on product page:**
- Large product images (carousel)
- Product name, brand, price
- Description & specs
- Available options (color, size, quantity)
- "Legg i handlekurv" (Add to cart) button
- Stock status
- Shipping info, price guarantee badge, mattress trial badge (if applicable)
- Related products or reviews

### 8. Use Store Locator
**URL:** `/kundeservice/kontakt/`

**What you'll find:**
- Google Maps embedded with all Skeidar store locations
- Click a location pin to see store name, address, phone, hours
- Useful for click-&-collect inquiries or in-store questions

## Troubleshooting

**Q: Filter not updating?**
- Wait 1-2 seconds for page load
- Ensure JavaScript is enabled
- Try clicking filter again or reload page

**Q: Product not found?**
- Check spelling of brand/category name
- Verify stock status filter (some items may be regional-only)
- Try "All Products" without filters
- Use broader category (e.g., "Sofa" instead of "Stressless Sofa")

**Q: URL too long?**
- Multiple filters create long query strings (normal behavior)
- Copy/paste full URL, don't truncate

## Expected UI Elements
- Sidebar filter panel on left (desktop) or hamburger menu (mobile)
- "Legg i handlekurv" button (Add to cart) on each product
- Pagination controls at bottom
- Sort dropdown (top-right)
- Product grid (responsive)

## Rate Limiting & Etiquette
- No explicit rate limit announced
- Respect robots.txt: avoid hammering `/search` endpoint
- Reasonable click rate (1-2 per second)
- Do not scrape product pages in bulk without respecting crawl-delay
