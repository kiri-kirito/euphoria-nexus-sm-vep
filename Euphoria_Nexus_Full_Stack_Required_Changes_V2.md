# Euphoria Nexus — Full-Stack Course Project V2 Checklist

**Project:** Euphoria Nexus — Smart Multi-Vendor E-Commerce  
**Purpose:** Course/Demo Project  
**Checklist Version:** V2

---

# 1. Purpose of This Checklist

This checklist combines the issues identified from the SEOScore report and the project's reported application problems, then organizes the work into the areas that matter most for a course-level full-stack e-commerce project.

The priority is:

**Frontend → Backend → Database → Authentication → Security → E-commerce Logic → Images → Deployment → Basic SEO**

The goal is **not** to make the website perfect for production SEO. The goal is to make sure the application works correctly, safely, and consistently during the project demonstration.

---

# 2. PART A — CHANGES WE NEED TO MAKE

These are the issues that should be checked and fixed before the final demonstration.

---

# A. FRONTEND

## A1. General UI

- [ ] All important pages load without errors.
- [ ] No blank/white pages occur during normal use.
- [ ] Navigation links work.
- [ ] Buttons perform the correct action.
- [ ] Forms are usable and clearly labeled.
- [ ] Required fields are clearly indicated.
- [ ] Success messages are understandable.
- [ ] Error messages are understandable.
- [ ] Loading states are shown when requests take time.
- [ ] Buttons are disabled during important submissions to prevent duplicate requests.
- [ ] No unnecessary console errors appear during normal use.

## A2. Responsive Design

Test at least:

- [ ] Desktop.
- [ ] Tablet.
- [ ] Mobile.

Check:

- [ ] Navbar.
- [ ] Product cards.
- [ ] Product details.
- [ ] Cart.
- [ ] Checkout.
- [ ] Login.
- [ ] Signup.
- [ ] Customer dashboard.
- [ ] Vendor dashboard.
- [ ] Admin dashboard.

## A3. Empty and Error States

- [ ] Empty cart has a proper message.
- [ ] No products found has a proper message.
- [ ] Failed product loading has a proper message.
- [ ] Invalid product/page shows a proper not-found state.
- [ ] Failed API requests show a useful message.
- [ ] Unauthorized pages redirect or show an appropriate message.

---

# B. AUTHENTICATION & USER ACCOUNTS

## B1. Signup

The project notes identify a signup problem.

- [ ] Signup works successfully.
- [ ] Required fields are validated.
- [ ] Email format is validated.
- [ ] Password rules are validated.
- [ ] Password and confirm-password must match.
- [ ] Duplicate email is handled.
- [ ] Correct success message is displayed.
- [ ] Correct error message is displayed.
- [ ] New user is saved correctly in the database.
- [ ] Newly registered user can log in.

## B2. Login

- [ ] Correct credentials allow login.
- [ ] Wrong password shows an error.
- [ ] Non-existing account shows an error.
- [ ] Empty fields are validated.
- [ ] Loading state works.
- [ ] User is redirected to the correct page/dashboard.
- [ ] Logout works.
- [ ] Session remains valid after normal page refresh if intended.

## B3. Show/Hide Password

Add a visibility option to:

- [ ] Login password.
- [ ] Signup password.
- [ ] Confirm password.
- [ ] Forgot/reset password.
- [ ] Change password.

Example:

`Password: •••••••• 👁`

The eye button should correctly show and hide the password.

## B4. Forgot Password

The project notes identify a Forgot Password/message problem.

- [ ] Forgot Password page works.
- [ ] Email input is validated.
- [ ] Correct response is shown after submitting.
- [ ] Reset mechanism works.
- [ ] New password can be saved.
- [ ] Old password no longer works after successful reset.
- [ ] New password works for login.
- [ ] Reset/error messages match the actual result.

## B5. Roles

For the multi-vendor application:

- [ ] Customer role works.
- [ ] Vendor role works.
- [ ] Admin role works.
- [ ] Each role sees the correct dashboard.
- [ ] Each role has only the permissions it should have.

---

# C. BACKEND & API

## C1. API Functionality

- [ ] All important frontend API requests work.
- [ ] API returns the expected data.
- [ ] API handles invalid requests.
- [ ] API handles missing data.
- [ ] API handles unauthorized requests.
- [ ] API handles server/database errors.
- [ ] Correct HTTP status codes are returned.
- [ ] API responses do not expose unnecessary sensitive information.

## C2. Backend Validation

Do not rely only on frontend validation.

- [ ] Required fields are validated on the backend.
- [ ] Email is validated on the backend.
- [ ] Password rules are validated on the backend.
- [ ] Product quantity is validated.
- [ ] Product price is validated.
- [ ] User permissions are validated.
- [ ] IDs and requested resources are validated.

## C3. Duplicate Requests

- [ ] Repeated signup requests are handled safely.
- [ ] Repeated order submissions do not create duplicate orders.
- [ ] Repeated payment/order actions do not create duplicate transactions if payment is implemented.
- [ ] Buttons/loading states prevent accidental double submission.

## C4. API Error Handling

Test:

- [ ] Database unavailable.
- [ ] Invalid request.
- [ ] Unauthorized request.
- [ ] Resource not found.
- [ ] Server error.
- [ ] Network failure.

The frontend should show a useful message instead of crashing.

---

# D. DATABASE

## D1. Data Storage

Verify that these are stored correctly:

- [ ] Users.
- [ ] Vendors.
- [ ] Products.
- [ ] Categories.
- [ ] Product images/URLs.
- [ ] Cart data if stored server-side.
- [ ] Orders.
- [ ] Order items.
- [ ] Customer addresses.
- [ ] Messages.
- [ ] Replies.
- [ ] Relevant status values.

## D2. Relationships

Check that:

- [ ] User → Orders relationship is correct.
- [ ] Vendor → Products relationship is correct.
- [ ] Vendor → Orders relationship is correct.
- [ ] Order → Order Items relationship is correct.
- [ ] Product → Category relationship is correct.
- [ ] Customer → Address relationship is correct.
- [ ] Message → User relationship is correct.

## D3. CRUD Operations

Test:

- [ ] Create.
- [ ] Read.
- [ ] Update.
- [ ] Delete.

Every important CRUD operation should update the database correctly.

## D4. Data Integrity

- [ ] Duplicate records are prevented where necessary.
- [ ] Required database fields cannot be incorrectly empty.
- [ ] Invalid foreign-key relationships are prevented.
- [ ] Deleting/updating data does not unnecessarily break existing orders.
- [ ] Order history remains consistent.

---

# E. SECURITY

These checks are especially important for a full-stack project.

## E1. Password Security

- [ ] Passwords are not stored as plain text.
- [ ] Passwords are hashed securely.
- [ ] Passwords are never returned in normal API responses.
- [ ] Passwords are not printed in console logs.

## E2. Authentication Security

- [ ] Protected APIs require authentication.
- [ ] Protected pages require authentication.
- [ ] Logout properly ends the session.
- [ ] Expired/invalid sessions are handled.
- [ ] Authentication information is not exposed unnecessarily.

## E3. Authorization

Backend authorization must be enforced.

- [ ] Customer cannot access Admin APIs.
- [ ] Customer cannot access Vendor APIs.
- [ ] Vendor cannot access Admin APIs.
- [ ] Vendor cannot edit another vendor's product.
- [ ] Vendor cannot access another vendor's private data.
- [ ] User cannot access another user's private order/message data simply by changing an ID.

## E4. Sensitive Information

- [ ] Database credentials are not exposed in frontend code.
- [ ] API secrets are not exposed in client-side code.
- [ ] Environment variables are used for secrets.
- [ ] Sensitive information is not committed to Git.
- [ ] Production configuration does not contain development secrets.

## E5. Basic Security Headers

If practical for the current deployment:

- [ ] X-Content-Type-Options.
- [ ] X-Frame-Options.
- [ ] Referrer-Policy.
- [ ] Permissions-Policy.
- [ ] Content-Security-Policy where compatible with the application.

The SEO report identified missing security-related headers, but these should be implemented carefully so they do not break the application.

---

# F. E-COMMERCE LOGIC

## F1. Products

- [ ] Product list works.
- [ ] Product details work.
- [ ] Categories work.
- [ ] Search works.
- [ ] Filters work if implemented.
- [ ] Sorting works if implemented.
- [ ] Stock information is correct.
- [ ] Out-of-stock products are handled correctly.

## F2. Cart

- [ ] Add to cart works.
- [ ] Remove from cart works.
- [ ] Increase quantity works.
- [ ] Decrease quantity works.
- [ ] Quantity cannot become negative.
- [ ] Stock limits are respected.
- [ ] Cart subtotal is correct.
- [ ] Cart total is correct.
- [ ] Cart state behaves correctly after refresh if persistence is intended.

## F3. Price Validation

The backend should not blindly trust the price sent by the frontend.

- [ ] Product price is retrieved/verified on the backend.
- [ ] Order total is calculated correctly.
- [ ] Quantity is verified.
- [ ] Stock is verified before creating an order.
- [ ] Discount calculations are verified on the backend if discounts exist.
- [ ] Shipping calculation is verified if implemented.

## F4. Checkout

- [ ] Customer information works.
- [ ] Phone number works.
- [ ] Address works.
- [ ] City works.
- [ ] Zone works.
- [ ] Shipping information works.
- [ ] Order total is correct.
- [ ] Checkout validation works.
- [ ] Order can be submitted.
- [ ] Order is saved correctly.
- [ ] Duplicate order submission is prevented.
- [ ] Confirmation is displayed.

## F5. Order Management

- [ ] Customer can see their orders.
- [ ] Vendor can see relevant orders.
- [ ] Admin can manage orders.
- [ ] Order status is correct.
- [ ] Order status changes are saved.
- [ ] Order history remains consistent.
- [ ] Cancellation works if included.
- [ ] Refund works if included.

## F6. Stock Management

- [ ] Stock decreases correctly after a successful order.
- [ ] User cannot order more than available stock.
- [ ] Out-of-stock product cannot be purchased.
- [ ] Vendor can update stock.
- [ ] Product availability updates correctly.

---

# G. MULTI-VENDOR FUNCTIONALITY

## G1. Vendor

- [ ] Vendor registration works if included.
- [ ] Vendor login works.
- [ ] Vendor dashboard works.
- [ ] Vendor can add products.
- [ ] Vendor can edit products.
- [ ] Vendor can delete products.
- [ ] Vendor can manage stock.
- [ ] Vendor can manage product images.
- [ ] Vendor can see relevant orders.
- [ ] Vendor cannot modify another vendor's products.

## G2. Admin

- [ ] Admin login works.
- [ ] Admin dashboard works.
- [ ] Admin can manage users.
- [ ] Admin can manage vendors.
- [ ] Admin can manage products.
- [ ] Admin can manage categories.
- [ ] Admin can manage orders.
- [ ] Admin can manage messages.

---

# H. MESSAGING SYSTEM

The project notes identify problems with complete/reply functionality and message results.

- [ ] Customer can send a message.
- [ ] Message is saved.
- [ ] Admin/Vendor can view the message.
- [ ] Admin/Vendor can reply.
- [ ] Reply is saved.
- [ ] Customer can see the reply.
- [ ] Message status updates correctly.
- [ ] UI message matches the actual operation.

Example:

`Pending → Replied/Resolved`

The database status and displayed status must remain consistent.

---

# I. CITY & ZONE

The project notes indicate that City needs to be added so that Zone can be selected correctly.

Recommended structure:

`Country → City → Zone → Address`

- [ ] City is available.
- [ ] Zone depends on the selected City.
- [ ] Unrelated zones are not shown.
- [ ] City/Zone data is stored correctly.
- [ ] Checkout uses the correct City/Zone.
- [ ] Shipping calculation uses the correct location if applicable.

---

# J. IMAGES & STATIC ASSETS

## J1. Product Images

- [ ] Product images load.
- [ ] Product detail images load.
- [ ] Cart images load.
- [ ] Order images load.
- [ ] Vendor dashboard images load.
- [ ] Admin images load.
- [ ] Images load after page refresh.
- [ ] Images load on the deployed website.
- [ ] Image URLs do not depend on local computer paths.

## J2. Image Failure

- [ ] Broken images have a fallback.
- [ ] Useful ALT text is provided.
- [ ] Missing images do not break the layout.

## J3. Image Performance

The SEO report found 17 images without width/height.

- [ ] Add image dimensions.
- [ ] Use appropriate Next.js image handling where applicable.
- [ ] Keep images responsive.
- [ ] Consider WebP/AVIF for suitable images.

---

# K. DEPLOYMENT

## K1. Production Environment

- [ ] Production website loads.
- [ ] Production frontend connects to the correct backend/API.
- [ ] Production database works.
- [ ] Production environment variables are correct.
- [ ] No localhost URLs are used accidentally.
- [ ] No local file paths are used for production images.

## K2. Environment Variables

- [ ] Database URL is configured.
- [ ] Authentication secrets are configured.
- [ ] API keys are configured securely.
- [ ] Secrets are not hard-coded in frontend code.
- [ ] `.env` secrets are not committed to Git.

## K3. Deployment Testing

After deployment, test again:

- [ ] Signup.
- [ ] Login.
- [ ] Logout.
- [ ] Forgot password.
- [ ] Product loading.
- [ ] Product images.
- [ ] Cart.
- [ ] Checkout.
- [ ] Order creation.
- [ ] Vendor dashboard.
- [ ] Admin dashboard.
- [ ] Messaging.
- [ ] Mobile view.

Do not assume that something working locally will automatically work after deployment.

## K4. Route Handling

- [ ] Main routes load directly.
- [ ] Refreshing important routes works.
- [ ] Not-found pages work.
- [ ] Authentication redirects work.
- [ ] API routes work in production.

---

# L. BASIC SEO

Only fix the SEO issues that are useful for a course/demo website.

## L1. H1

The SEO report found **3 H1 tags**.

- [ ] Keep exactly one primary H1.
- [ ] Use H2/H3 for secondary sections.

Example:

`H1 — Smart Multi-Vendor E-Commerce`

`H2 — Featured Products`

`H2 — Popular Categories`

## L2. Meta Description

The report found an 83-character meta description.

- [ ] Improve the description so it clearly explains the website.
- [ ] Include the main purpose of the website naturally.

## L3. Canonical URL

The report identified a missing canonical tag.

- [ ] Add canonical URL through the Next.js metadata configuration.

## L4. Open Graph

Recommended but not critical:

- [ ] og:title.
- [ ] og:description.
- [ ] og:image.
- [ ] og:url.
- [ ] og:type.

## L5. robots.txt & sitemap

Recommended if easy to implement:

- [ ] robots.txt.
- [ ] sitemap.xml.

## L6. Structured Data

Optional for the course project:

- [ ] Basic Product/Organization JSON-LD if appropriate.

Do not spend excessive time trying to satisfy every structured-data check.

---

# 3. PART B — CHANGES WE DO NOT NEED TO MAKE NOW

These were reported by the SEO/AEO/GEO scanner but are not necessary for the current course/demo project.

## A. Advanced AEO/GEO

Do not prioritize:

- [ ] AI Overview optimization.
- [ ] AI extraction optimization.
- [ ] Question-style headings only for AI.
- [ ] Expert quotes.
- [ ] Author credentials.
- [ ] AI citation optimization.
- [ ] AI-specific entity optimization.
- [ ] Original-data signals.
- [ ] AI-focused statistics.
- [ ] Multiple question types.
- [ ] AI recommendation/comparison content.

## B. Advanced Content SEO

Do not prioritize:

- [ ] Long-form SEO articles.
- [ ] SEO-only Table of Contents.
- [ ] FAQ content only to improve scanner results.
- [ ] Definition lists for AI extraction.
- [ ] `<details>/<summary>` sections for AI.
- [ ] Extensive external source citations.
- [ ] Case studies.
- [ ] Expert opinion sections.
- [ ] Industry terminology optimization.
- [ ] First-person pronoun optimization.
- [ ] Transition-word percentage optimization.
- [ ] SEO-specific conclusion sections.

## C. Advanced Technical SEO

Do not prioritize unless specifically required by the instructor:

- [ ] RSS/Atom feed.
- [ ] hreflang for multiple languages.
- [ ] Advanced BreadcrumbList schema.
- [ ] Extensive schema markup.
- [ ] Person/Author schema optimization.
- [ ] sameAs links to Wikipedia/Wikidata/LinkedIn.
- [ ] Google Discover-specific optimization.
- [ ] Advanced AI crawler configuration.

## D. Cross-Border Commerce

The project notes mention that cross-border features are not present.

For the current course project:

- [ ] Do not make international/cross-border commerce a priority unless it is explicitly required by the project specification.

If required later, consider:

`Country → Currency → International Shipping`

---

# 4. FINAL PRIORITY ORDER

## 🔴 MUST FIX BEFORE DEMO

1. Signup.
2. Login/authentication.
3. Forgot Password.
4. Show/Hide Password.
5. Product images not loading.
6. Image fallback.
7. Cart.
8. Checkout.
9. Orders.
10. Stock/price validation.
11. City → Zone.
12. Messaging/reply system.
13. Vendor functionality.
14. Admin functionality.
15. Backend validation.
16. Database data integrity.
17. Authentication/authorization.
18. Basic security.
19. Error handling.
20. Loading states.
21. Production/deployment testing.
22. One H1.
23. Basic meta description.
24. Canonical URL.

## 🟠 SHOULD FIX IF TIME IS AVAILABLE

1. Image dimensions.
2. Open Graph metadata.
3. robots.txt.
4. sitemap.xml.
5. Basic JSON-LD/Product schema.
6. Security headers.
7. Better image formats such as WebP/AVIF.
8. Better empty/error states.
9. More polished mobile responsiveness.

## 🟢 DO NOT SPEND TIME ON NOW

1. Advanced AEO.
2. GEO optimization.
3. AI Overview optimization.
4. Expert quotes.
5. Advanced E-E-A-T.
6. AI citation optimization.
7. FAQ solely for SEO.
8. Comparison content for AI.
9. RSS feed.
10. hreflang if there is only one language.
11. Advanced schema.
12. AI-specific content formatting.

---

# 5. FINAL DEMO TEST

Before submitting the project, perform one complete test from the customer's perspective:

`Signup`
↓
`Login`
↓
`Browse Products`
↓
`View Product`
↓
`Add to Cart`
↓
`Update Quantity`
↓
`Checkout`
↓
`Select City`
↓
`Select Zone`
↓
`Place Order`
↓
`Order Confirmation`
↓
`View Order`

Then test:

`Vendor Login`
↓
`Add/Edit Product`
↓
`Upload Product Image`
↓
`View Order`

Then test:

`Admin Login`
↓
`Manage Users`
↓
`Manage Vendors`
↓
`Manage Products`
↓
`Manage Orders`
↓
`Manage Messages`

Finally test:

`Logout`
↓
`Forgot Password`
↓
`Reset Password`
↓
`Login Again`

---

# 6. Final Goal

The project does **not** need to achieve a 100% SEOScore.

The target is:

**Frontend works**
→ **Backend works**
→ **Database works**
→ **Authentication works**
→ **Security is reasonable**
→ **E-commerce logic works**
→ **Images/assets work**
→ **Vendor/Admin roles work**
→ **Deployment works**
→ **Basic SEO is clean**

Once these are working, the application is in a strong position for a course/demo submission.
