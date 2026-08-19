# EUPHORIA NEXUS
# ANTIGRAVITY IMPLEMENTATION SPECIFICATION
## Full-Stack Course Project — Required Fixes & Scope

**Version:** 1.0  
**Project Type:** Course/Demo Full-Stack E-Commerce Website  
**Instruction:** Implement only the required fixes described in this document. Do not spend development time on the items explicitly marked as out of scope.

---

# 1. OBJECTIVE

The goal is to make the Euphoria Nexus e-commerce website **functionally complete and stable for the course demonstration**.

The priority is NOT to achieve a 100% SEO score.

The priority is:

1. Frontend functionality
2. Backend/API functionality
3. Database correctness
4. Authentication
5. Authorization/security
6. E-commerce business logic
7. Product images/assets
8. Deployment
9. Basic SEO

After implementation, the main customer, vendor, and admin flows must work from beginning to end.

---

# 2. IMPORTANT SOURCE INFORMATION

The following requirements come from the project's supplied issue document and SEOScore report.

## 2.1 Project Issue Document

The project issue document reports:

- Signup problem — line 33
- Complete/reply does not work — line 37
- Message after processing does not match — line 41
- Forgot Password / message option problem — lines 45–46
- Cross-border features are missing — line 47
- City needs to be added so Zone works correctly — line 48

## 2.2 SEOScore Report

The SEOScore report identifies, among other things:

- 3 H1 tags
- Missing canonical
- 83-character meta description
- Missing Open Graph information
- 1 render-blocking script
- Missing robots.txt
- Missing sitemap.xml
- 17 images missing width/height
- 1 non-descriptive link text
- Missing JSON-LD structured data
- Several missing security headers

These SEO findings should be treated according to the priority described below.

---

# 3. IMPLEMENTATION RULES FOR ANTIGRAVITY

Before making changes:

1. Inspect the existing project structure.
2. Identify the frontend framework.
3. Identify the backend/API structure.
4. Identify the database and schema.
5. Identify the authentication implementation.
6. Identify where images are stored.
7. Identify the deployment configuration.
8. Reuse the existing architecture where possible.
9. Do not rewrite the whole project unnecessarily.
10. Do not remove existing working features.
11. Do not change unrelated UI or business logic.
12. Fix the smallest amount of code necessary to solve each issue.
13. After every major fix, test the related flow.
14. Do not assume a problem exists if the source only recommends checking it.
15. Do not implement out-of-scope SEO/AEO/GEO features just to improve a scanner score.

---

# 4. PRIORITY LEVELS

## P0 — MUST FIX

A broken core feature or a problem that can prevent the demo from working.

## P1 — SHOULD FIX

Important for a polished course project but should not delay core functionality.

## P2 — OPTIONAL

Useful improvement if development time remains.

## OUT OF SCOPE

Do not spend time on it for this course version unless the instructor specifically requires it.

---

# 5. P0 — AUTHENTICATION

## TASK AUTH-01 — Fix Signup

**Source:** Project issue document, line 33.

### Problem

The project issue document explicitly reports a signup problem.

### Required action

Inspect the complete signup flow:

`Signup Form → Frontend Validation → API → Backend Validation → Database → Success Response`

Verify and fix:

- Required fields.
- Email validation.
- Password validation.
- Confirm-password matching.
- Duplicate email handling.
- Backend validation.
- Database insertion.
- Correct success message.
- Correct error message.

### Acceptance criteria

A new user must be able to:

1. Open Signup.
2. Enter valid information.
3. Submit the form.
4. See a successful response.
5. Find the user in the database.
6. Log in using the newly created account.

Invalid input must not create an account.

---

## TASK AUTH-02 — Verify Login

**Source:** Full-stack verification requirement.

### Required action

Test:

- Correct email/password.
- Incorrect password.
- Non-existing account.
- Empty fields.
- Logout.
- Session persistence where intended.

### Acceptance criteria

Valid credentials log the user in.

Invalid credentials do not.

Logout ends the authenticated session.

---

## TASK AUTH-03 — Add Show/Hide Password

**Source:** Project requirement identified during review.

### Required action

Add a show/hide password control to:

- Login
- Signup
- Confirm Password
- Forgot/Reset Password
- Change Password, if present

### Acceptance criteria

Clicking the eye icon changes:

`password → visible`

and back:

`visible → password`

The feature must not change the actual password value.

---

## TASK AUTH-04 — Fix Forgot Password

**Source:** Project issue document, lines 45–46.

### Problem

The issue document reports a Forgot Password problem and a message option that is not working.

### Required action

Verify:

`Forgot Password → Email → Reset Process → New Password → Login`

Fix:

- Email validation.
- Reset request.
- Reset mechanism.
- Success/error message.
- New password saving.
- Login with new password.

### Acceptance criteria

After a successful password reset, the user can log in using the new password.

---

# 6. P0 — MESSAGING

## TASK MSG-01 — Fix Complete/Reply

**Source:** Project issue document, line 37.

### Problem

The document reports that the complete/reply functionality does not work.

### Required action

Inspect:

`Customer Message → Admin/Vendor → Open → Reply/Complete → Database → Customer`

Fix the frontend action, API request, backend operation, and database update as necessary.

### Acceptance criteria

- Customer can send a message.
- Admin/Vendor can open it.
- Admin/Vendor can reply.
- Reply is saved.
- Customer can see the reply.
- Complete/reply status is updated.

---

## TASK MSG-02 — Fix Message Status/Response Mismatch

**Source:** Project issue document, line 41.

### Problem

The document reports that after processing, the displayed message does not match the actual result.

### Required action

Make these three states consistent:

`Backend Result = Database State = Frontend Message`

Example:

Successful reply:

`Database: Replied`

`Frontend: Message replied successfully`

Failed reply:

`Database: unchanged`

`Frontend: Unable to reply`

### Acceptance criteria

The UI must never report success when the backend/database operation failed.

---

# 7. P0 — PRODUCT IMAGES

## TASK IMG-01 — Fix Product Images Not Loading

**Source:** User-reported project issue during review.**

**Important:** This is a reported project problem, but it is NOT stated as a confirmed broken-image finding in the SEOScore report. Investigate it directly.

### Required investigation

Trace:

`Database Image Field → API Response → Frontend Image Component → Actual File/URL → Browser`

Check:

- Database image path.
- API response.
- Frontend `src`.
- Image storage.
- File existence.
- Production URL.
- CORS/access restrictions if applicable.
- Local vs deployed behavior.

### Important

Do not use local paths such as:

`C:\project\uploads\product.jpg`

for a deployed website.

### Acceptance criteria

Product images must load:

- Product listing
- Product details
- Cart
- Orders
- Vendor dashboard
- Admin pages where applicable
- After page refresh
- On the deployed website

---

## TASK IMG-02 — Add Image Fallback

### Required action

If an image fails to load, display a proper fallback instead of a broken-image icon.

### Acceptance criteria

Broken/missing image:

`→ fallback image or placeholder`

The layout must remain stable.

---

## TASK IMG-03 — Fix Image Dimensions

**Source:** SEOScore report, Page 3, lines 86–87.

### Problem

The report found 17 images without width/height and identifies potential layout shift.

### Required action

Add appropriate dimensions or use the framework's recommended image component.

### Acceptance criteria

Images reserve appropriate layout space before loading and remain responsive.

---

# 8. P0 — CART & CHECKOUT

## TASK CART-01 — Verify Cart

### Required action

Test:

- Add product.
- Remove product.
- Increase quantity.
- Decrease quantity.
- Prevent negative quantity.
- Respect stock.
- Calculate subtotal.
- Calculate total.
- Preserve cart state as intended.

### Acceptance criteria

Cart totals and quantities are correct after every operation.

---

## TASK ORDER-01 — Verify Checkout

### Required action

Test:

`Cart → Checkout → Customer Info → City → Zone → Address → Order → Confirmation`

Verify:

- Customer information.
- Phone number.
- Address.
- City.
- Zone.
- Shipping.
- Total.
- Order creation.
- Confirmation.

### Acceptance criteria

A valid checkout creates exactly one correct order.

---

## TASK ORDER-02 — Prevent Duplicate Orders

### Required action

Prevent double-click/repeated submission from creating duplicate orders.

### Acceptance criteria

One checkout action creates one order.

---

## TASK ORDER-03 — Validate Price on Backend

**Status:** Recommended full-stack verification; not a confirmed bug in the supplied reports.

### Required action

Do not trust the product price sent by the browser.

The backend should retrieve/verify the product price and calculate the order total.

### Acceptance criteria

Changing the frontend request price cannot create an incorrect order total.

---

## TASK ORDER-04 — Validate Stock

**Status:** Recommended full-stack verification; not a confirmed bug in the supplied reports.

### Required action

Backend must verify available stock before accepting an order.

### Acceptance criteria

A customer cannot purchase more units than available.

Stock updates correctly after a successful order.

---

# 9. P0 — CITY AND ZONE

## TASK LOC-01 — Fix City → Zone Dependency

**Source:** Project issue document, line 48.

### Problem

The document indicates that City needs to be added so that Zone works correctly.

### Required structure

`Country → City → Zone → Address`

### Required action

- Add/verify City.
- Make Zone depend on selected City.
- Update Zone when City changes.
- Prevent unrelated zones from being selected.
- Save correct City and Zone with the order/address.

### Acceptance criteria

Selecting City A shows only City A's zones.

Changing to City B updates the Zone list correctly.

---

# 10. P0 — VENDOR SYSTEM

## TASK VENDOR-01 — Verify Vendor CRUD

### Required action

Verify:

- Vendor login.
- Vendor dashboard.
- Add product.
- Edit product.
- Delete product.
- Stock management.
- Image management.
- Relevant order viewing.

### Acceptance criteria

Vendor can manage only their permitted products/orders.

---

## TASK VENDOR-02 — Protect Vendor Ownership

**Status:** Recommended security verification; not a confirmed bug.

### Required action

Backend must verify ownership.

A vendor must not be able to modify another vendor's product by changing an ID in the request.

### Acceptance criteria

Unauthorized vendor requests are rejected by the backend.

---

# 11. P0 — ADMIN SYSTEM

## TASK ADMIN-01 — Verify Admin Functions

Verify:

- Admin login.
- User management.
- Vendor management.
- Product management.
- Category management.
- Order management.
- Message management.

### Acceptance criteria

Admin functions work correctly and are protected from non-admin users.

---

# 12. P0 — DATABASE

## TASK DB-01 — Verify Core Data

Check that the database correctly stores:

- Users
- Vendors
- Products
- Categories
- Product images/URLs
- Orders
- Order items
- Addresses
- Messages
- Replies
- Status values

---

## TASK DB-02 — Verify Relationships

Verify relationships such as:

`User → Orders`

`Vendor → Products`

`Vendor → Orders`

`Order → Order Items`

`Product → Category`

`Customer → Address`

`Message → User`

### Acceptance criteria

No incorrect or orphaned relationships are created by normal application use.

---

## TASK DB-03 — Verify CRUD

Test:

`Create → Read → Update → Delete`

for all major entities.

---

# 13. P0 — SECURITY

## TASK SEC-01 — Password Storage

**Status:** Verification required; not a confirmed bug.

### Required action

Inspect the authentication implementation.

### Acceptance criteria

Passwords must never be stored as plain text.

Passwords must not appear in normal API responses or logs.

---

## TASK SEC-02 — Backend Authorization

**Status:** Verification required; not a confirmed bug.

### Required action

Verify authorization on the backend, not only by hiding frontend buttons.

Test:

- Customer → Admin API
- Customer → Vendor API
- Vendor → Admin API
- Vendor → Another Vendor's product
- User → Another User's private order/message

### Acceptance criteria

Unauthorized requests are rejected.

---

## TASK SEC-03 — Environment Secrets

### Required action

Check that:

- Database credentials are not hard-coded.
- API secrets are not exposed.
- Authentication secrets are stored in environment variables.
- `.env` secrets are not committed to Git.

---

# 14. P1 — FRONTEND ERROR & LOADING STATES

## TASK UI-01 — Add/Verify Loading States

Verify loading states for:

- Login
- Signup
- Product loading
- Add to cart
- Checkout
- Order submission
- Dashboard/API operations

### Acceptance criteria

Users cannot accidentally submit important forms multiple times while a request is processing.

---

## TASK UI-02 — Add/Verify Error States

Verify:

- API failure
- Database failure
- Product not found
- Unauthorized access
- Image failure
- Network failure

### Acceptance criteria

The application shows a useful message instead of crashing or showing a blank page.

---

# 15. P1 — DEPLOYMENT

## TASK DEPLOY-01 — Production Configuration

Verify:

- Production frontend URL.
- Production API URL.
- Production database.
- Environment variables.
- No accidental localhost URLs.
- No local image paths.

---

## TASK DEPLOY-02 — Production End-to-End Test

After deployment, repeat:

`Signup`
→ `Login`
→ `Browse Products`
→ `Product Details`
→ `Product Image`
→ `Add to Cart`
→ `Checkout`
→ `City`
→ `Zone`
→ `Place Order`
→ `View Order`

Then:

`Vendor Login`
→ `Manage Product`
→ `View Order`

Then:

`Admin Login`
→ `Manage Users`
→ `Manage Vendors`
→ `Manage Products`
→ `Manage Orders`
→ `Manage Messages`

Finally:

`Forgot Password`
→ `Reset Password`
→ `Login Again`

---

# 16. P1 — BASIC SEO

## TASK SEO-01 — Fix Multiple H1 Tags

**Source:** SEOScore report, Page 2, lines 32–35.

### Problem

The report found:

`3 H1 tags`

### Required action

Reduce the page to one main H1.

Use H2/H3 for other section headings.

### Acceptance criteria

Rendered page has:

`Exactly 1 H1`

---

## TASK SEO-02 — Add Canonical

**Source:** SEOScore report, Page 2, lines 36–38; Page 3, lines 117–120.

### Problem

Canonical tag is missing.

### Required action

Add canonical URL through the existing Next.js metadata setup.

### Acceptance criteria

Rendered HTML contains the correct canonical URL.

---

## TASK SEO-03 — Improve Meta Description

**Source:** SEOScore report, Page 3, lines 45–46.

### Problem

The report identifies an 83-character meta description as too short.

### Required action

Replace it with a meaningful description explaining the Euphoria Nexus e-commerce platform.

### Acceptance criteria

The correct description appears in the page metadata.

---

## TASK SEO-04 — Open Graph Metadata

**Source:** SEOScore report, Page 3, lines 98–116.

### Problem

The report identifies missing Open Graph fields.

### Required action

If time permits, add:

- `og:title`
- `og:description`
- `og:image`
- `og:url`
- `og:type`
- `og:site_name`

### Priority

P1/P2. Do not delay core functionality for this.

---

## TASK SEO-05 — robots.txt

**Source:** SEOScore report, Page 3, lines 56–62.

### Problem

No robots.txt was found.

### Required action

Add a basic robots.txt for the deployed site if practical.

### Priority

P2.

---

## TASK SEO-06 — sitemap.xml

**Source:** SEOScore report, Page 3, lines 63–69.

### Problem

No sitemap.xml was found.

### Required action

Add a sitemap if practical.

### Priority

P2.

---

## TASK SEO-07 — Descriptive Link Text

**Source:** SEOScore report, Page 3, lines 95–96.

### Problem

The report found one non-descriptive link such as:

`Learn More`

### Required action

Replace generic text with descriptive text where appropriate.

Example:

`View Product Details`

### Priority

P2.

---

## TASK SEO-08 — Structured Data

**Source:** SEOScore report, Page 4, lines 148–152.

### Problem

No JSON-LD structured data was found.

### Required action

Optional: add basic Product/Organization structured data if it can be done without disrupting the application.

### Priority

P2.

---

# 17. P1 — SECURITY HEADERS

**Source:** SEOScore report, Page 3, lines 133–138 and Page 4, lines 171–174.

The report identifies missing:

- `X-Content-Type-Options`
- Content-Security-Policy
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### Required action

Add appropriate security headers if supported by the current deployment.

### IMPORTANT

Do not add a strict Content-Security-Policy blindly.

First inspect:

- Scripts.
- Images.
- API calls.
- Authentication.
- External resources.

A bad CSP can break the website.

### Priority

P1/P2.

---

# 18. P2 — SEO ITEMS TO LEAVE ALONE

Do NOT spend time implementing the following only to improve the SEOScore:

## Advanced AEO/GEO

- AI Overview optimization.
- AI extraction optimization.
- Expert quotes.
- Author credentials.
- AI citation optimization.
- AI-specific entity optimization.
- Original-data signals.
- AI-focused statistics.
- AI recommendation/comparison content.
- Question-style headings only for AI.

## Advanced Content SEO

- Long SEO articles.
- SEO-only FAQ content.
- Definition lists for AI.
- `<details>/<summary>` for AI.
- Case studies.
- Extensive expert content.
- Extensive external citations.
- Industry terminology optimization.
- First-person wording optimization.
- Transition-word percentage optimization.

## Advanced Technical SEO

- RSS/Atom feeds.
- hreflang for a single-language course project.
- Extensive breadcrumb schema.
- Extensive entity schema.
- sameAs optimization.
- Google Discover optimization.
- AI crawler optimization.

---

# 19. CROSS-BORDER FEATURES

**Source:** Project issue document, line 47.

The project issue document says cross-border features are missing.

### Decision for this version

**DO NOT implement unless the course requirements explicitly require international/cross-border commerce.**

If required later:

`Country → Currency → International Shipping`

---

# 20. DO NOT REWRITE THE PROJECT

Antigravity should NOT:

- Rewrite the whole frontend.
- Replace the existing framework.
- Replace the database without a clear reason.
- Replace authentication unnecessarily.
- Redesign unrelated pages.
- Remove working features.
- Change the existing business model.
- Add complex production infrastructure just for SEO.
- Add advanced AI/AEO/GEO functionality.

The objective is to **repair and complete the existing project**, not rebuild it.

---

# 21. IMPLEMENTATION ORDER

Follow this order.

## Phase 1 — Core Application

1. Signup
2. Login
3. Show/Hide Password
4. Forgot Password
5. Messaging/Reply
6. Product Images
7. Cart
8. Checkout
9. Orders
10. City/Zone

## Phase 2 — Roles & Data

11. Vendor
12. Admin
13. Database relationships
14. Backend validation
15. Authorization
16. Stock validation
17. Price validation

## Phase 3 — Stability

18. Error handling
19. Loading states
20. Image fallback
21. Deployment
22. Production testing

## Phase 4 — Basic SEO

23. One H1
24. Canonical
25. Meta description
26. Open Graph
27. robots.txt
28. sitemap.xml
29. Basic structured data

## Phase 5 — Optional

30. Security headers
31. Image optimization
32. Additional SEO improvements

---

# 22. FINAL ACCEPTANCE TEST

The implementation is complete only when the following complete flow works.

## Customer

`Signup`
→ `Login`
→ `Browse`
→ `View Product`
→ `Image Loads`
→ `Add to Cart`
→ `Change Quantity`
→ `Checkout`
→ `Select City`
→ `Select Zone`
→ `Place Order`
→ `Order Confirmation`
→ `View Order`

## Vendor

`Vendor Login`
→ `Dashboard`
→ `Add Product`
→ `Upload Image`
→ `Edit Product`
→ `Manage Stock`
→ `View Order`

## Admin

`Admin Login`
→ `Dashboard`
→ `Users`
→ `Vendors`
→ `Products`
→ `Categories`
→ `Orders`
→ `Messages`
→ `Reply/Complete`

## Authentication

`Forgot Password`
→ `Reset Password`
→ `Login With New Password`

## Security

Verify:

`Customer ≠ Vendor ≠ Admin`

and verify that users cannot access other users' private data.

---

# 23. COMPLETION RULE

Do not report the project as complete merely because the pages open.

A task is complete only when:

1. The UI works.
2. The API works.
3. The database operation works.
4. The correct response is shown to the user.
5. The feature works after refresh where applicable.
6. The feature works in the deployed environment where applicable.
7. Unauthorized users cannot perform the operation.
8. No unrelated functionality was broken.

---

# 24. FINAL MESSAGE FOR ANTIGRAVITY

**Implement the P0 tasks first.**

Do not spend time on advanced SEO/AEO/GEO items.

For every P0/P1 task:

1. Inspect the existing implementation.
2. Identify the actual root cause.
3. Make the minimum necessary code changes.
4. Test the complete flow.
5. Verify frontend + backend + database consistency.
6. Verify authorization where applicable.
7. Verify the deployed version where applicable.
8. Do not modify unrelated features.

The final target is a **working, stable, demonstrable full-stack e-commerce application**, not a 100% SEO scanner score.
