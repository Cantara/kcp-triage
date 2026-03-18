**Potential Hidden Backend APIs (Inferred)**

While no explicit public REST APIs were discovered in the crawl data, Skeidar operates a full e-commerce platform with interactive features (cart, checkout, product filtering, store locator) that almost certainly rely on backend APIs not visible in static HTML:

### 1. **E-Commerce Product API** (Confidence: High)
- **Evidence:** Product pages load dynamically with filter/sort/pagination; GTM e-commerce tracking suggests product data is fed to tracking via API
- **Suspected endpoints:**
  - `GET /api/products` or `/api/v1/products` – List products with filters
  - `GET /api/products/{id}` – Product detail (specs, stock, price)
  - `GET /api/stock/{id}` – Real-time stock status
- **Used for:** Product filtering, sorting, pagination, availability checks
- **Verification:** Open browser Network tab (F12 → Network), apply filters on `/alle-produkter/`, check XHR requests for API calls

### 2. **Shopping Cart API** (Confidence: High)
- **Evidence:** Cart is blocked in robots.txt (`/cart/`), suggesting it's session-based; cart interactions happen without full page reloads
- **Suspected endpoints:**
  - `POST /api/cart/add` – Add item to cart
  - `GET /api/cart` – Retrieve cart contents
  - `PATCH /api/cart/{item_id}` – Update quantity/options
  - `DELETE /api/cart/{item_id}` – Remove item
- **Used for:** Cart state management, item persistence across sessions
- **Verification:** Add item to cart, open Network tab, observe POST/PATCH requests to API endpoints

### 3. **Checkout & Order API** (Confidence: High)
- **Evidence:** Checkout is blocked in robots.txt (`/checkout/`); form submission validates address, shipping method, and creates order
- **Suspected endpoints:**
  - `POST /api/orders` – Create new order (requires session/auth)
  - `GET /api/orders/{order_id}` – Retrieve order details (user auth required)
  - `POST /api/checkout/validate-address` – Validate postal code & address
  - `GET /api/shipping-methods` – Fetch available shipping options based on address
  - `POST /api/checkout/apply-promo` – Apply promo code
- **Used for:** Order placement, address validation, shipping cost calculation, payment processing
- **Verification:** Go through checkout flow in browser, check Network tab for API calls during form submission and "Place Order" button click

### 4. **Store Locator API** (Confidence: Medium-High)
- **Evidence:** Google Maps API is loaded; page references store locator on `/kundeservice/kontakt/`
- **Suspected endpoints:**
  - `GET /api/stores` – List all store locations (lat/long, address, phone, hours)
  - `GET /api/stores/nearby` – Get stores near user's location (if geolocation enabled)
- **Used for:** Populate store pins on Google Maps, display store details (address, phone, hours)
- **Verification:** Visit `/kundeservice/kontakt/`, open Network tab, look for XHR to `/api/stores` or similar

### 5. **User Account & Authentication API** (Confidence: High)
- **Evidence:** Login, account, orders, and wishlist pages are blocked in robots.txt; session-based auth implied
- **Suspected endpoints:**
  - `POST /api/auth/login` – User login
  - `POST /api/auth/register` – Create new account
  - `POST /api/auth/logout` – Destroy session
  - `GET /api/user/profile` – Retrieve user info (name, email, addresses)
  - `PATCH /api/user/profile` – Update profile
  - `GET /api/user/orders` – Retrieve order history
  - `GET /api/user/wishlist` – Retrieve saved items
- **Used for:** Customer accounts, saved addresses, order tracking, wishlist management
- **Verification:** Attempt login with test credentials, observe authentication flow in Network tab

### 6. **Payment Gateway API** (Confidence: High)
- **Evidence:** Multiple payment methods listed (card, invoice, Klarna, Santander); checkout mentions financing partners
- **Suspected partners & endpoints:**
  - Klarna: `https://api.klarna.com/...` (third-party)
  - Santander: Similar third-party integration
  - Internal payment processor: `POST /api/payments` or `/api/transactions`
- **Used for:** Payment processing, financing approval, transaction validation
- **Verification:** Attempt checkout with different payment methods, observe requests to payment gateway endpoints in Network tab

### 7. **Search API** (Confidence: Medium)
- **Evidence:** `/search` endpoint is blocked in robots.txt; search functionality inferred from product browsing
- **Suspected endpoint:**
  - `GET /api/search?q={query}` – Full-text product search
- **Used for:** Product search by name, brand, category
- **Verification:** If search box exists on homepage, search for a product and check Network requests

### 8. **Email/Notification API** (Confidence: Medium)
- **Evidence:** Confirmation emails, order updates, "notify me when back in stock" features implied in customer service pages
- **Suspected endpoints:**
  - `POST /api/notifications/subscribe` – Subscribe to alerts
  - `POST /api/email/send-confirmation` – Send order confirmation email
- **Used for:** Order confirmations, shipping notifications, restock alerts, promotional emails
- **Verification:** Complete an order and check email; inspect Network tab for email-related API calls

### 9. **Inventory/Stock Status API** (Confidence: High)
- **Evidence:** Products show "Webshop", "Rask levering" (fast delivery), and "Ikke på lager" (out of stock) statuses
- **Suspected endpoint:**
  - `GET /api/inventory/{product_id}` – Real-time stock status at each warehouse
- **Used for:** Display stock status, prevent out-of-stock sales, trigger "notify me" alerts
- **Verification:** Check product page for stock indicators; monitor Network tab for real-time stock updates

### 10. **Analytics & E-Commerce Tracking API** (Confidence: High)
- **Evidence:** Google Tag Manager (GTM-WPCV33) is loaded; e-commerce tracking (ENABLE_ECOMMERCE=True)
- **Suspected integrations:**
  - Google Analytics 4: `https://www.google-analytics.com/...`
  - GTM event tracking: `https://www.googletagmanager.com/...`
- **Used for:** Track product views, add-to-cart events, purchase events, user behavior
- **Verification:** Open browser console, search for analytics calls; inspect GTM container for tracked events

---

## How to Investigate Further

### Step 1: Browser Network Inspection
1. Open Skeidar.no in Chrome/Firefox
2. Press F12 → Network tab
3. Filter by **XHR** (XMLHttpRequest) or **Fetch** requests
4. Perform actions:
   - Apply product filters → Look for API calls
   - Add item to cart → Observe POST request
   - Proceed to checkout → Check form submission endpoints
   - Enter address → Watch validation API calls
5. Document all API endpoints, HTTP methods, request/response structure

### Step 2: Reverse Engineering (Advanced)
1. Visit `/alle-produkter/?filter=stock_status|WEBSHOP&page=1` in browser
2. Right-click → "Inspect" → "Network" tab
3. Apply new filter → Capture XHR request URL, headers, response
4. Look for patterns:
   - API base URL (e.g., `/api/`, `/services/`, or `/endpoint/`)
   - Filter parameter names (e.g., `stock_status`, `p_brand`)
   - Pagination structure (e.g., `page`, `limit`, `offset`)

### Step 3: JavaScript Code Analysis
1. Check page source (Ctrl+U) for hardcoded API URLs or endpoints
2. Look for JavaScript bundles (e.g., `/js/app.js`) that may contain API logic
3. Use DevTools Sources tab to trace function calls when filters are applied

### Step 4: Test Endpoints Directly
Once endpoints are identified, test with curl/Postman:
```bash
curl -X GET "https://www.skeidar.no/api/products?filter=stock_status|WEBSHOP&page=1" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: application/json"
```

### Step 5: Check Competitor Sites
Other Norwegian furniture e-commerce sites (e.g., Møbelringen, IKEA.no) may have publicly documented APIs or similar patterns that hint at Skeidar's architecture.

---

## Notes for LLM Agents

- **Do not attempt unauthorized API access.** Stick to authenticated flows if user provides credentials.
- **Respect rate limits.** Even if APIs are discovered, follow ethical crawling standards (1-2 requests/second).
- **Session management required.** Most backend APIs likely require valid session cookies from login.
- **HTTPS/TLS validation.** Ensure all API calls use HTTPS and verify SSL certificates.
- **No hardcoded credentials.** Do not extract or use admin API keys, if found.
