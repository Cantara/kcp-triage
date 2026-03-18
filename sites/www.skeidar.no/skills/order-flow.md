# Skill: Complete E-Commerce Order Flow (Browse → Cart → Checkout)

## Overview
This skill documents the complete purchase workflow on Skeidar.no, from product selection to checkout. **IMPORTANT: Agent must stop before payment submission and hand off to the user.**

## Prerequisites
- None for browsing
- User account or guest email for checkout
- User authorization required before initiating any cart or checkout actions

## Step-by-Step Order Flow

### Phase 1: Product Selection & Browse
**Responsibility:** Agent

1. **Navigate to product** (see `navigate` skill)
   - Use `/alle-produkter/` or category pages
   - Apply filters to find desired item

2. **Click product card** to view detail page
   - Expected URL: `/alle-produkter/{category}/{product-name}/`

3. **Review product page:**
   - Product images (carousel)
   - Price (including any discounts)
   - Product name, brand, SKU
   - Description, dimensions, materials
   - Stock status ("Webshop", "Rask levering", or "Ikke på lager")
   - Shipping info (free over 5,000 NOK)
   - Badges: "Prisløfte" (price guarantee), "Komfortgaranti" (100-day mattress trial)

**User action required?** No; agent can browse freely.

### Phase 2: Select Product Options
**Responsibility:** Agent (with user guidance)

1. **Review available options** on product page:
   - **Color/finish** – Dropdown or radio buttons (e.g., "Sort", "Grå", "Beige")
   - **Size** – For mattresses, bed frames, or other sized items (e.g., "140x200", "180x200")
   - **Quantity** – Number spinner (default 1)
   - **Customization** (if any) – May include fabrics, add-ons, or configurations

2. **Expected HTML elements:**
   ```html
   <select id="color">...<option>Farger</option>...</select>
   <select id="size">...<option>Størrelse</option>...</select>
   <input type="number" id="quantity" min="1" value="1" />
   ```

3. **Fill in selections** as directed by user
   - Agent should confirm option availability before adding to cart
   - If option is grayed out or unavailable, inform user

**User action required?** Yes; user must specify desired color, size, quantity, or confirm defaults.

### Phase 3: Add to Cart
**Responsibility:** Agent (with explicit user authorization)

1. **User authorization check:**
   - Agent must ask user: "Should I add this to your cart?"
   - User must explicitly confirm

2. **Click "Legg i handlekurv" button**
   - Button text: "Legg i handlekurv" (Add to cart) or "Kjøp nå" (Buy now)
   - Location: Usually bottom-right of product options
   - Button may open modal or redirect to cart

3. **Expected response:**
   - Success: Modal or page update showing item added ("Varen er lagt i handlekurven")
   - User sees option to "Fortsett handler" (Continue shopping) or "Gå til handlekurv" (Go to cart)
   - Cart counter at top updates (if visible)

4. **If out of stock:**
   - Modal alerts user: "Dessverre er varen ikke på lager"
   - Agent must inform user and suggest alternatives

**User action required?** Yes; explicit authorization needed.

### Phase 4: Review Cart
**Responsibility:** Agent (optional, recommended)

1. **Access cart** – Click "Handlekurv" (Cart) link in top navigation or "Gå til handlekurv" button after add
   - Expected URL: `/cart/` (may be blocked in robots.txt for crawlers, but user sessions can access)

2. **Cart page shows:**
   - Each item: Image, name, selected options (color, size), quantity, unit price
   - Subtotal for each line item
   - Subtotal (sum of all items)
   - Estimated shipping cost (if over 5,000 NOK, shipping is free)
   - Order total

3. **User can from cart:**
   - Modify quantity (up/down buttons)
   - Remove items (trash icon)
   - Continue shopping (back to `/alle-produkter/`)
   - Proceed to checkout ("Til kasse" button)

**Agent responsibility:** Review items with user, confirm correctness, note order subtotal.

### Phase 5: Proceed to Checkout
**Responsibility:** Agent (with user authorization)

1. **User authorization:**
   - Agent asks: "Ready to proceed to checkout?"
   - User must confirm

2. **Click "Til kasse" (Checkout)** button on cart page
   - Expected redirect: `/checkout` or similar checkout flow

3. **Checkout page loads** with sections:
   - **Shipping Address:** Full name, street, postal code, city, country
   - **Shipping Method:** Standard (2-5 business days), Express (1 business day), or Click & Collect (kjøp-og-hent)
   - **Billing Address:** Same as shipping or different (checkbox)
   - **Contact Info:** Email, phone (required for order confirmation)
   - **Order Summary:** Items, quantities, prices, shipping cost, total

4. **Expected form fields:**
   ```html
   <input type="text" name="firstName" placeholder="Fornavn" />
   <input type="text" name="lastName" placeholder="Etternavn" />
   <input type="text" name="address" placeholder="Adresse" />
   <input type="text" name="postalCode" placeholder="Postnummer" />
   <input type="text" name="city" placeholder="By" />
   <select name="shippingMethod">...<option>Standard levering</option>...</select>
   <input type="email" name="email" placeholder="E-post" />
   <input type="tel" name="phone" placeholder="Telefon" />
   ```

5. **Promotional code field (optional):**
   - "Rabattkode" (Promo code) input box
   - Agent can apply code if user provides one

**User action required?** Yes; agent can pre-fill known info, but user must verify address and contact details.

### Phase 6: Select Payment Method
**Responsibility:** Agent (information only)

1. **Payment methods visible on checkout:**
   - **Kredittkort** (Credit card) – Visa, Mastercard, American Express
   - **Debit card** (Bankkort)
   - **Invoice/Financing** – Klarna, Santander, other Norwegian financing partners (if available)
   - **PayPal** (possibly, if integrated)
   - **Bank transfer** (manual payment, rare for e-commerce)

2. **Agent responsibility:**
   - Note which payment methods are available
   - Inform user of options
   - **Do NOT enter payment details on behalf of user**

3. **Expected form section:**
   ```html
   <fieldset name="paymentMethod">
     <label><input type="radio" name="payment" value="card" /> Kredittkort</label>
     <label><input type="radio" name="payment" value="invoice" /> Faktura</label>
     <label><input type="radio" name="payment" value="paypal" /> PayPal</label>
   </fieldset>
   ```

### Phase 7: Order Review & Summary
**Responsibility:** Agent (read-only, summary only)

1. **Checkout page displays final order summary:**
   - All items, quantities, individual prices
   - Subtotal
   - Shipping cost (or "Gratis frakt" if over 5,000 NOK)
   - Tax (VAT - "Mva")
   - **Total amount due (NOK)**

2. **Terms & conditions checkbox:**
   - User must check: "Jeg godtar betingelser" (I accept terms)
   - Links to return policy, privacy policy, T&Cs

3. **Agent responsibility:**
   - Read back the final amount to user
   - Confirm all items and address are correct
   - Inform user of estimated delivery date (based on shipping method selected)

### Phase 8: STOP – HAND OFF TO USER
**Responsibility:** User

**⚠️ CRITICAL: Agent must NOT proceed beyond this point.**

At this stage, the checkout form displays:
- Final "Bestill nå" (Place Order) or "Bekreft bestilling" (Confirm Order) button
- Payment method selector (if not already selected)
- Payment details input fields (card number, CVV, expiration, billing address)

**Agent action:**
1. **Inform user:**
   ```
   "Your order is ready. The total is [AMOUNT] NOK.
   Order summary:
   - [ITEM 1] (Qty: X) – [PRICE]
   - [ITEM 2] (Qty: Y) – [PRICE]
   
   Shipping to: [ADDRESS]
   Delivery method: [METHOD] (Est. delivery: [DATE])
   
   Payment method: [METHOD]
   
   I cannot complete the payment. Please review the information above and click 'Place Order' to finish your purchase. You'll receive an order confirmation email at [EMAIL]."
   ```

2. **Provide user with:**
   - Exact total amount
   - All order items and quantities
   - Delivery address and method
   - Estimated delivery date
   - Customer service contact info if user wants to modify order before payment

3. **Do NOT:**
   - Fill in payment card details
   - Click "Bestill nå" (Place Order) button
   - Submit any payment information
   - Auto-complete CVV, expiration, or cardholder name fields
   - Confirm payment without explicit user action at the payment page

## Expected Responses & Error Handling

### Success Responses
- **Add to cart:** Modal shows "Varen er lagt i handlekurven" with checkmark
- **Proceed to checkout:** Page loads checkout form with customer info fields
- **Submit order (user does this):** Confirmation page shows order number, estimated delivery, "Takk for bestillingen" (Thank you for your order)

### Error Responses

**Out of stock:**
```
Dessverre er varen ikke på lager
Vi sender deg en mail når varen er på lager igjen.
```
Agent action: Suggest alternatives or inform user.

**Invalid postal code:**
```
Postnummeret er ikke gyldig
```
Agent action: Ask user to verify postal code.

**Shipping not available to address:**
```
Levering til denne adressen er ikke mulig
```
Agent action: Ask user to use alternative address or contact customer service.

**Invalid email:**
```
E-posten er ikke gyldig
```
Agent action: Ask user to re-enter email address.

**Payment declined (user sees after clicking Place Order):**
```
Betalingen ble avslått. Prøv på nytt eller kontakt din bank.
```
Agent: Inform user to retry with valid payment method or contact customer service.

## Order Confirmation

After user completes payment:
1. **Confirmation page** displays:
   - Order number (e.g., "Ordrenummer: #12345678")
   - Message: "Takk for bestillingen!" (Thank you for your order)
   - Estimated delivery date
   - Confirmation email sent to user's email address

2. **User receives email with:**
   - Order number
   - Item list
   - Delivery address
   - Tracking link (if applicable)
   - Customer service contact info
   - Link to manage order or check status at `/orders` (requires login)

## Tips & Notes

**Free shipping:**
- Orders over 5,000 NOK qualify for free shipping
- Displayed on checkout: "Gratis frakt over 5000 kr"

**Price guarantee (Prisløfte):**
- Skeidar guarantees lowest price on all furniture
- If user finds lower price elsewhere, Skeidar will match it
- Policy link: `/kundeservice/prislofte/`

**Mattress comfort guarantee (Komfortgaranti):**
- 100-day trial on all mattresses
- Customer can return for full refund within 100 days
- Policy link: `/kundeservice/komfortgaranti/`

**Financing options:**
- Some customers may see financing/payment plan options at checkout
- Usually 0% APR for 6-12 months (subject to approval)
- Info: `/kundeservice/finansiering/`

**Stock status during checkout:**
- If item goes out of stock between cart view and checkout, user may be notified
- Agent should monitor for any stock warnings

## Troubleshooting

**Q: Add to cart button not working?**
- Ensure all required options (color, size) are selected
- Check browser console for JavaScript errors
- Try refreshing page

**Q: Checkout page not loading?**
- Clear browser cache/cookies
- Try incognito/private window
- Check browser compatibility (Chrome, Firefox, Safari, Edge recommended)

**Q: Shipping cost not showing?**
- Ensure postal code is entered correctly on checkout
- Some regions may have restricted shipping (agent can contact customer service)

**Q: Promo code not applying?**
- Verify code is typed correctly (case-sensitive?)
- Check code expiration date
- Ensure code applies to items in cart (some codes exclude sale items)

## Customer Service Contact
If order issues arise, customer service: `/kundeservice/kontakt/`
- Email: netthandel@skeidar.no
- Phone: Available on contact page by store location
- Chat: Check homepage for live chat option (may be available)
