# Euphoria Nexus — Project Audit & Fix Checklist

> **Created:** 2026-08-12  
> **Purpose:** Conversation history (`conversation_history.md`), requirements docs, ar current codebase audit theke sob remaining flaw, bug, missing feature, ar solved item track korar master checklist.  
> **How to use:** `[x]` = verified done | `[~]` = partially done / fragile | `[ ]` = not done or broken  
> **Source docs:** `REQUIREMENTS_AND_PROCESS.md`, `PROJECT_UPDATE.md`, `DUMMY_DATA_PLAN.md`, `conversation_history.md`

---

## Executive Summary

Anti Gravity diye onek kaj hoyeche — UI, Supabase integration, seed data (382 users, 200 products, 597 orders), auth, checkout, delivery flow, admin settings, etc. Kintu **PROJECT_UPDATE.md te "complete" mark thakleo** codebase audit ar conversation history dekhay **onek feature ekhono mock fallback, schema mismatch, ba incomplete logic e depend kore**.

**Overall readiness estimate:** ~55–65% demo-ready | ~35–45% production-ready

| Area | Status |
|------|--------|
| Buyer catalog & checkout | Partial |
| Cross-Seller Bundling | Broken logic (not real DB bundles) |
| Bulk Negotiations | UI only; Socket.io not persisted |
| Local Seller Discovery | Mock fallback; no real geo |
| Inter-Seller Stock Exchange | Schema mismatch; mock fallback |
| Delivery Agent portal | Partial |
| Support Agent portal | Partial |
| Admin portal | Mostly working |
| Real-time sync across roles | Partial (DB writes work; no live subscriptions) |
| Deployment | Config ready; manual deploy pending |

---

## Legend

- **Priority:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
- **Type:** 🐛 Bug | 🧩 Missing Feature | ⚠️ Logic Flaw | 🎭 Mock/Static | 🗄️ Schema | 🔗 Integration

---

## 1. Infrastructure & Database

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| 1.1 | Supabase schema deployed (`SCHEMA_TO_RUN.sql`) | 🔴 | 🗄️ | [~] | User ran SQL + seed; but some tables/RPC still missing in code references |
| 1.2 | Seed data (300 buyers, 50 sellers, 20 agents, 10 support, 2 admin, 200 products) | 🔴 | — | [x] | `seed.js`, `sync_users.js`, `seed_products.js` — conversation confirms populated |
| 1.3 | `platform_settings` table | 🟠 | 🗄️ | [x] | `backend/platform_settings.sql` — user ran "done" |
| 1.4 | **`escrow` table** (Support escrow page queries this) | 🔴 | 🗄️ | [ ] | Code: `support/escrow/page.tsx` → always falls back to `MOCK_ESCROWS` |
| 1.5 | **`get_sellers_within_radius()` RPC** (PostGIS) | 🔴 | 🗄️ | [ ] | Code: `api.ts` → always falls back to `MOCK_SELLERS` (TechHaven, Fresh Grocer…) |
| 1.6 | **`stock_bids` vs `bids` table name** | 🔴 | 🗄️ | [ ] | Seller bidding queries `bids`; schema has `stock_bids` |
| 1.7 | **`negotiations` columns** (`offeredPrice`, `finalPrice`) | 🟠 | 🗄️ | [ ] | Schema has `current_price` only; seller negotiations update wrong columns |
| 1.8 | **`users.company` column** (profile page) | 🟡 | 🗄️ | [ ] | Profile save may fail if column missing |
| 1.9 | **`product_bundles` + `bundle_items` populated** | 🟠 | 🗄️ | [ ] | Tables exist in schema but UI generates fake bundles from product pairs instead |
| 1.10 | Backend Express server (`backend/server.js`) running for Socket.io | 🟠 | 🔗 | [ ] | Only `/api/health` REST; chat/negotiations/bidding need separate `npm start` in backend |
| 1.11 | Production deploy (Vercel + Render) | 🟡 | — | [ ] | Configs exist; user manual action per `PROJECT_UPDATE.md` |
| 1.12 | TanStack Query (per requirements) | 🟢 | 🧩 | [ ] | Not in `package.json`; raw Supabase calls used instead |

---

## 2. Global / Cross-Role Issues

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| 2.1 | Mock fallback pattern hides real DB failures | 🔴 | ⚠️ | [ ] | `api.ts`, dashboards silently show fake data when query fails — user sees "working" UI with wrong data |
| 2.2 | No Supabase Realtime subscriptions | 🟠 | 🧩 | [ ] | Order/complaint/delivery changes require page refresh; not "instant parallel" across roles |
| 2.3 | Socket.io events not persisted to DB | 🔴 | 🔗 | [ ] | Negotiations, bids, chat are ephemeral unless manually saved |
| 2.4 | Socket.io has no authentication | 🟠 | ⚠️ | [ ] | Anyone can emit/receive on `/negotiations`, `/bidding`, `/chat` |
| 2.5 | Role naming inconsistency (`agent` vs `delivery`) | 🟡 | ⚠️ | [~] | Middleware partially fixed; still scattered in UI labels |
| 2.6 | `mockUserRole` localStorage still used in layouts | 🟡 | 🎭 | [ ] | `delivery/layout.tsx`, `seller/layout.tsx`, `admin/layout.tsx` logout paths |
| 2.7 | **About page** (`/about`) | 🟢 | 🧩 | [ ] | Hero links to `/about` — page does not exist (404) |
| 2.8 | **3D Interactive UI** (React Three Fiber) | 🟢 | 🧩 | [ ] | Mentioned in requirements; never implemented |
| 2.9 | Dead/unused components | 🟢 | — | [ ] | `ProductGrid.tsx`, `FilterSidebar.tsx` — zero imports |
| 2.10 | Guest mode should hide cart icon | 🟡 | ⚠️ | [~] | Fixed once; verify still holds after cart store changes |
| 2.11 | Profile dropdown shows redundant user details | 🟡 | 🎭 | [~] | User asked to remove name/email/role from dropdown (available in My Account) |
| 2.12 | Navbar search → `/explore?search=` | 🟠 | — | [~] | Implemented; needs full verification with filters |

---

## 3. Buyer Role

### 3.1 Catalog, Search & Images

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| B1 | Homepage loads real products from Supabase | 🔴 | — | [x] | Verified via dev server — real seller names visible |
| B2 | Product images match product name/category | 🔴 | 🐛 | [ ] | User reported multiple times; Unsplash mapping still inconsistent |
| B3 | Some products show no image (text only) | 🔴 | 🐛 | [ ] | Broken/missing `images` JSON or bad URL |
| B4 | Product detail image fills container (`object-cover`) | 🟠 | 🐛 | [~] | Claimed fixed; user said still broken — re-verify |
| B5 | Click product → opens correct detail page (real UUID) | 🔴 | — | [x] | Fixed invalid `stores!seller_id` join in `api.ts` |
| B6 | Navbar main search bar works | 🟠 | — | [~] | Duplicate explore search removed; main search wired |
| B7 | Explore filter sidebar layout (sticky, not infinite height) | 🟠 | 🐛 | [~] | User: sidebar extends full page height incorrectly |
| B8 | Explore "Apply Filters" button | 🟠 | 🧩 | [~] | Claimed added; verify price/category/nearby |
| B9 | Explore "Sort by" logic | 🟠 | 🧩 | [~] | Claimed added; verify actually sorts |
| B10 | **Nearby Sellers filter** (distance-based, buyer location) | 🔴 | 🧩 | [ ] | Needs browser geolocation + PostGIS RPC; currently mock or basic client filter |
| B11 | Category click from hero → category-filtered explore | 🟡 | — | [~] | User requested; verify |

### 3.2 Cart & Checkout

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| B12 | Add to cart from explore grid | 🔴 | — | [~] | Wired to Zustand; user reported grid add didn't persist — verify |
| B13 | Add to cart from product detail | 🔴 | — | [x] | Works via product page |
| B14 | Cart empty for guest / new session | 🟠 | — | [~] | Storage key changed to `euphoria-cart-v2` |
| B15 | Checkout pre-fills logged-in user address | 🟠 | — | [x] | Profile data auto-populate added |
| B16 | Checkout completes without schema errors | 🔴 | 🐛 | [~] | `delivery_fee` column error fixed; UUID sanitization added |
| B17 | Checkout creates `payments` row | 🟠 | 🧩 | [ ] | Orders/deliveries created; payments may be missing → admin payouts empty for new orders |
| B18 | Checkout success page shows real order data | 🟡 | 🎭 | [ ] | Still static `#ORD-84392`, hardcoded amount; broken link `/profile/orders` |
| B19 | Mock payment UI validates amount | 🟡 | — | [x] | Per requirements — simulated success |

### 3.3 Orders, Profile & Wishlist

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| B20 | **My Orders** updates after checkout | 🔴 | — | [~] | Rewritten to fetch Supabase; user reported still not updating — verify RLS + buyer_id |
| B21 | Order complaint filing → Support sees it | 🟠 | — | [~] | E2E test claimed pass; verify in browser |
| B22 | Profile shows logged-in user's real name | 🔴 | 🐛 | [~] | Was showing wrong hardcoded name; partially fixed |
| B23 | Profile orders/negotiations tabs | 🟡 | 🎭 | [ ] | Hardcoded mock arrays in profile page |
| B24 | **Wishlist** persistence | 🟡 | 🧩 | [ ] | Empty-state UI only; no DB table |
| B25 | **Seller apply form** (`/seller/apply`) | 🟠 | 🎭 | [ ] | Form UI only; submit links to dashboard, no DB write |

### 3.4 Bundles (Cross-Seller Bundling — FR 5.1)

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| B26 | Homepage Featured Bundles from DB | 🔴 | ⚠️ | [~] | Uses product pairs with 15% discount — **NOT** `product_bundles` table |
| B27 | **"View Bundle" opens bundle UI, not single product** | 🔴 | 🐛 | [ ] | `FeaturedBundles.tsx` links to `/product/${item1.id}` instead of `/bundle/id1/id2` |
| B28 | Dedicated `/bundles` page | 🟠 | — | [x] | Exists; same pair logic, not real bundles |
| B29 | `/bundle/[...ids]` bundle detail page | 🟠 | — | [x] | Exists but route not linked from homepage cards |
| B30 | "Find Bundle Deals" in explore filters | 🟡 | — | [~] | Claimed added |
| B31 | Bundle: single delivery fee logic | 🟠 | ⚠️ | [ ] | Not implemented in checkout |
| B32 | Bundle: return policy (discount void on partial return) | 🟡 | ⚠️ | [ ] | Documented in requirements; not implemented |
| B33 | Seller-side bundle create/join UI | 🟠 | 🎭 | [ ] | `/seller/bundling` — static card, buttons do nothing |

### 3.5 Bulk Negotiations (FR 5.2)

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| B34 | MOQ threshold shows "Negotiate" button | 🟠 | — | [~] | MOQ badge visible on products |
| B35 | BulkDealModal submits successfully | 🟠 | — | [~] | Socket dependency removed for local demo; uses `seller-mock-id` |
| B36 | Negotiation persisted to `negotiations` table | 🔴 | 🔗 | [ ] | Socket only; no DB insert on buyer propose |
| B37 | Custom checkout link after deal accepted | 🔴 | 🧩 | [ ] | Requirements specify; not implemented |
| B38 | Real-time chat between buyer & seller | 🟠 | 🔗 | [ ] | GlobalChatWidget exists but simplified mock |

### 3.6 Local Seller Discovery (FR 5.3)

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| B39 | "Sellers Near You" homepage section | 🔴 | 🎭 | [ ] | **Shows MOCK_SELLERS** (TechHaven, Fresh Grocer) — confirmed in browser 2026-08-12 |
| B40 | Click local seller → show that seller's products/info | 🔴 | 🐛 | [ ] | Currently redirects to `/explore?search=sellerName` only |
| B41 | Seller opt-in for same-day delivery | 🟠 | 🧩 | [ ] | Seller settings page doesn't save to DB |
| B42 | Buyer geolocation for distance calc | 🔴 | 🧩 | [ ] | Hardcoded Dhaka coords in `LocalSellers.tsx` |
| B43 | "Update Location" button | 🟡 | 🎭 | [ ] | Button exists; does nothing |

---

## 4. Seller Role

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| S1 | Seller dashboard real stats | 🟠 | — | [~] | Supabase query + fallback; hardcoded "+12.5%" change |
| S2 | Product list CRUD | 🔴 | — | [x] | List + delete works |
| S3 | **Add new product** (save to DB) | 🔴 | — | [~] | Form exists; user reported add doesn't persist — verify RLS + seller_id |
| S4 | Product image auto-suggest by name | 🟠 | — | [x] | Unsplash/category mapping on new product form |
| S5 | Supabase Storage image upload | 🟠 | — | [x] | Implemented in `products/new/page.tsx` |
| S6 | Seller orders from real `order_items` | 🟠 | — | [x] | Fetches real data |
| S7 | Seller analytics (`/seller/analytics`) | 🟠 | — | [x] | Revenue from real order_items |
| S8 | **Negotiations inbox** | 🔴 | 🎭 | [ ] | Queries DB but falls back to `MOCK_ACTIVE`; wrong column names |
| S9 | **Blind bidding board** | 🔴 | 🎭 | [ ] | Queries wrong table `bids`; always mock |
| S10 | **Cross-seller bundling** (`/seller/bundling`) | 🔴 | 🎭 | [ ] | Static "AudioTech" card; no backend |
| S11 | **Seller settings** (store, same-day opt-in, payout) | 🟠 | 🎭 | [ ] | Full UI; no Supabase save handlers |
| S12 | Seller registration approval flow | 🟠 | — | [~] | Admin can approve in `/admin/sellers`; apply form doesn't create pending store |
| S13 | Stock exchange escrow trigger on bid accept | 🔴 | 🔗 | [ ] | Socket emits escrow state; no `escrow` table |

---

## 5. Delivery Agent Role

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| D1 | Portal routing (`/delivery/dashboard`) | 🔴 | 🐛 | [x] | Fixed 404 + agent role middleware |
| D2 | Switch to delivery mode from navbar | 🔴 | 🐛 | [x] | Fixed middleware for `agent` role |
| D3 | Dashboard shows unassigned new deliveries | 🔴 | — | [~] | Checkout creates `agent_id: null`; verify query |
| D4 | Pick Up assigns delivery to agent | 🟠 | — | [~] | Implemented in dashboard |
| D5 | Mark Delivered updates DB + earnings | 🔴 | — | [~] | User reported no change; Phase 5 fix claimed |
| D6 | `/delivery/tasks` dynamic list | 🟠 | — | [x] | Restored + wired to Supabase |
| D7 | `/delivery/tasks/[id]` status updates | 🟠 | — | [x] | Picked Up → In Transit → Delivered |
| D8 | `/delivery/earnings` from delivered count | 🟠 | — | [x] | ৳120/delivery calculation |
| D9 | **Delivery profile** (`/delivery/profile`) | 🟡 | 🎭 | [ ] | Static "Karim Ahmed"; no DB |
| D10 | Agent online/offline persisted to `users.is_online` | 🟠 | 🧩 | [ ] | Layout toggle is local-only |
| D11 | Map view on task pages | 🟢 | 🎭 | [ ] | Placeholder comment only |
| D12 | Hardcoded nav link `/delivery/tasks/84392` | 🟡 | 🐛 | [ ] | In `delivery/layout.tsx` |
| D13 | Cross-seller bundle multi-pickup routing | 🟡 | ⚠️ | [ ] | Not implemented |

---

## 6. Support Agent Role

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| SP1 | Support dashboard complaints queue | 🟠 | — | [~] | Supabase + mock fallback |
| SP2 | `/support/tickets` list | 🟠 | — | [~] | Real fetch + mock fallback |
| SP3 | **`/support/tickets/[id]` detail page** | 🔴 | 🎭 | [ ] | Fully mock chat; ignores URL id |
| SP4 | **`/support/escrow`** | 🔴 | 🎭 | [ ] | No `escrow` table → always mock |
| SP5 | **`/support/moderation`** | 🟠 | 🎭 | [ ] | Hardcoded negotiations; `alert()` on intervene |
| SP6 | Admin visibility of support agent performance | 🟠 | 🧩 | [ ] | User requested: which agent resolved how many tickets |
| SP7 | Escrow release on stock exchange confirm | 🔴 | ⚠️ | [ ] | Full workflow not implemented |

---

## 7. Admin Role

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| A1 | Admin dashboard GMV/users/orders | 🟠 | — | [x] | Real Supabase aggregates + mock fallback on error |
| A2 | Seller approval (`/admin/sellers`) | 🔴 | — | [x] | Works |
| A3 | User management (`/admin/users`) | 🟠 | — | [~] | Real fetch; falls back to `MOCK_USERS` |
| A4 | Agent creation CMS (`/admin/cms`) | 🟠 | — | [x] | API route creates auth + users row; temp password shown |
| A5 | Platform settings save (`/admin/settings`) | 🟠 | — | [x] | Wired to `platform_settings` after SQL run |
| A6 | Payouts (`/admin/payouts`) | 🟡 | — | [~] | Reads `payments`; empty if checkout doesn't insert payments |
| A7 | Activity logs (`/admin/logs`) | 🟡 | — | [x] | Derived from orders + complaints |
| A8 | Generate Report button | 🟡 | 🐛 | [~] | User reported not working; CSV export may exist in settings |
| A9 | Admin sees delivery agent completion stats | 🟠 | 🧩 | [ ] | User requested; not implemented |
| A10 | Admin sees support agent ticket stats | 🟠 | 🧩 | [ ] | User requested; not implemented |
| A11 | Banner/CMS management (removed/replaced) | 🟡 | — | [x] | Replaced with Agent Management per user feedback |
| A12 | Logout redirects to guest (not buyer view) | 🟡 | 🐛 | [~] | Claimed fixed |

---

## 8. Authentication & RBAC

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| AU1 | Login via Navbar popup modal (not `/login` page) | 🔴 | — | [x] | Per requirements |
| AU2 | Standalone `/register` page | 🟡 | ⚠️ | [~] | PROJECT_UPDATE says deleted; **still exists** and works |
| AU3 | Supabase Auth email/password | 🔴 | — | [x] | Real auth in Navbar |
| AU4 | Quick Login test accounts | 🟠 | — | [x] | admin1@, seller1@, buyer1@, etc. |
| AU5 | RBAC middleware (`src/proxy.ts`) | 🔴 | — | [x] | Next.js 16 proxy pattern |
| AU6 | Role-based dashboard access | 🔴 | — | [~] | Fixed multiple times; verify all 5 roles |
| AU7 | Session persists across navigation | 🟠 | — | [x] | localStorage + Supabase session |
| AU8 | Public registration: Sellers need admin approval | 🟠 | ⚠️ | [ ] | Apply form doesn't create pending seller |

---

## 9. Real-Time & Backend (Socket.io)

| # | Item | Pri | Type | Status | Notes |
|---|------|-----|------|--------|-------|
| RT1 | `/negotiations` namespace | 🟠 | — | [~] | Events defined; not persisted |
| RT2 | `/bidding` namespace | 🟠 | — | [~] | Events defined; not persisted |
| RT3 | `/chat` namespace (GlobalChatWidget) | 🟡 | 🎭 | [ ] | Simplified mock; no message history |
| RT4 | Backend must run separately on port 5000 | 🟠 | — | [ ] | `NEXT_PUBLIC_SOCKET_URL` or localhost:5000 |
| RT5 | Deal accept → custom checkout link generation | 🔴 | 🧩 | [ ] | Not implemented |

---

## 10. Requirements Gap (from `REQUIREMENTS_AND_PROCESS.md`)

| Requirement | Documented | Implemented | Status |
|-------------|------------|-------------|--------|
| FR-1 Accounts & RBAC | ✅ | Partial | [~] |
| FR-2 Product/inventory management | ✅ | Partial | [~] |
| FR-3 Orders, mock payment, tracking | ✅ | Partial | [~] |
| FR-4 Disputes, wallet logs, admin fees | ✅ | Partial | [~] |
| 5.1 Cross-Seller Bundling | ✅ | Fake pair logic | [ ] |
| 5.2 Bulk Negotiations | ✅ | UI + socket only | [ ] |
| 5.3 Local Seller Discovery | ✅ | Mock sellers | [ ] |
| 5.4 Inter-Seller Stock Exchange | ✅ | Mock + wrong table | [ ] |
| NFR Performance (<3s load) | ✅ | Unknown | [ ] |
| NFR Real-time (<5s websocket) | ✅ | Not verified | [ ] |
| PostGIS + Leaflet maps | ✅ | Placeholder only | [ ] |
| Zustand state | ✅ | ✅ | [x] |
| TanStack Query | ✅ | ❌ | [ ] |
| 3D Interactive (React Three Fiber) | ✅ | ❌ | [ ] |
| About page | Planned last | ❌ | [ ] |
| Wallet/transaction history UI | ✅ | ❌ | [ ] |
| Return/refund flow | ✅ | ❌ | [ ] |
| Notifications system (real) | ✅ | UI badge only | [ ] |

---

## 11. Pages Status Matrix (41 routes)

| Route | Real DB | Mock Fallback | Fully Working |
|-------|---------|---------------|---------------|
| `/` | ✅ | ✅ | [~] |
| `/explore` | ✅ | ✅ | [~] |
| `/product/[id]` | ✅ | — | [x] |
| `/cart` | — (Zustand) | — | [x] |
| `/checkout` | ✅ | — | [~] |
| `/checkout/success` | ❌ | ✅ static | [ ] |
| `/orders` | ✅ | — | [~] |
| `/profile` | Partial | ✅ tabs | [~] |
| `/register` | ✅ | — | [x] |
| `/wishlist` | ❌ | ✅ empty | [ ] |
| `/bundles` | ✅ pairs | — | [~] |
| `/bundle/[...ids]` | ✅ | — | [~] |
| `/seller/apply` | ❌ | ✅ form | [ ] |
| `/seller/dashboard` | ✅ | ✅ | [~] |
| `/seller/products` | ✅ | — | [x] |
| `/seller/products/new` | ✅ | — | [~] |
| `/seller/orders` | ✅ | — | [x] |
| `/seller/negotiations` | ❌ | ✅ | [ ] |
| `/seller/bidding` | ❌ | ✅ | [ ] |
| `/seller/bundling` | ❌ | ✅ static | [ ] |
| `/seller/analytics` | ✅ | — | [x] |
| `/seller/settings` | ❌ | ✅ static | [ ] |
| `/delivery/dashboard` | ✅ | ✅ | [~] |
| `/delivery/tasks` | ✅ | ✅ | [~] |
| `/delivery/tasks/[id]` | ✅ | — | [~] |
| `/delivery/orders` | ✅ | ✅ | [~] |
| `/delivery/earnings` | ✅ | — | [~] |
| `/delivery/profile` | ❌ | ✅ static | [ ] |
| `/support/dashboard` | ✅ | ✅ | [~] |
| `/support/tickets` | ✅ | ✅ | [~] |
| `/support/tickets/[id]` | ❌ | ✅ | [ ] |
| `/support/escrow` | ❌ | ✅ | [ ] |
| `/support/moderation` | ❌ | ✅ | [ ] |
| `/admin/dashboard` | ✅ | ✅ | [~] |
| `/admin/users` | ✅ | ✅ | [~] |
| `/admin/sellers` | ✅ | — | [x] |
| `/admin/payouts` | ✅ | — | [~] |
| `/admin/logs` | ✅ | — | [x] |
| `/admin/settings` | ✅ | — | [x] |
| `/admin/cms` | ✅ | — | [x] |

---

## 12. Recommended Fix Order (Serial Plan)

Use this order when fixing — matches dependency chain:

### Phase A — Database & Schema (blocker for many features)
- [ ] A1. Create `escrow` table + RLS
- [ ] A2. Create `get_sellers_within_radius(lat, lng, radius_km)` PostGIS RPC
- [ ] A3. Fix `seller/bidding` to use `stock_bids` not `bids`
- [ ] A4. Align `negotiations` schema OR fix frontend to use `current_price`
- [ ] A5. Seed `product_bundles` + `bundle_items` with real cross-seller bundles
- [ ] A6. Ensure checkout inserts into `payments`

### Phase B — Buyer Critical Path
- [ ] B1. Fix product images (re-run image mapping script + fallback component)
- [ ] B2. Fix bundle links: homepage → `/bundle/id1/id2`
- [ ] B3. Wire real bundles from `product_bundles` table
- [ ] B4. Local sellers: real PostGIS + explore nearby filter
- [ ] B5. Verify orders page updates after checkout
- [ ] B6. Fix checkout success page with real order ID

### Phase C — Seller Advanced Features
- [ ] C1. Fix add product persistence (RLS/seller_id)
- [ ] C2. Wire negotiations to DB + socket persist
- [ ] C3. Wire blind bidding to `stock_bids`
- [ ] C4. Implement seller bundling CRUD
- [ ] C5. Wire seller settings to `stores` table

### Phase D — Delivery & Support
- [ ] D1. Verify end-to-end delivery pick-up/deliver/earnings
- [ ] D2. Persist agent online status
- [ ] D3. Build support ticket detail page (real)
- [ ] D4. Wire escrow management to real table
- [ ] D5. Build moderation with real deadlocked negotiations

### Phase E — Admin & Cross-Role Sync
- [ ] E1. Agent performance dashboards for admin
- [ ] E2. Supabase Realtime subscriptions for orders/complaints/deliveries
- [ ] E3. Remove or gate mock fallbacks (dev-only flag)
- [ ] E4. Socket.io auth + DB persistence

### Phase F — Polish & Deploy
- [ ] F1. About page
- [ ] F2. Wishlist (optional table)
- [ ] F3. Wallet/transaction history
- [ ] F4. Deploy Vercel + Render
- [ ] F5. Full browser E2E test all roles

---

## 13. Conversation History — Claimed vs Verified

Many items marked "✅ complete" in `conversation_history.md` / `PROJECT_UPDATE.md` but **still open** in code:

| Claimed Complete | Actually |
|------------------|----------|
| Step 4–8 all roles complete | Many pages still mock fallback |
| Cross-Seller Bundling complete | Fake product pairs, not DB bundles |
| Local Seller Discovery complete | Mock sellers on homepage (verified 2026-08-12) |
| Blind Bidding complete | Wrong table name → always mock |
| Escrow Management complete | No escrow table |
| All mock data removed | Extensive `MOCK_*` constants remain |
| 36 routes production build | 41+ page routes exist |
| `/register` deleted | Still exists |
| Project 100% complete | ~55–65% demo-ready |

---

## 14. Test Accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@euphoria.com | Admin@1234 |
| Seller | seller1@euphoria.com | Seller@1234 |
| Buyer | buyer1@euphoria.com | Buyer@1234 |
| Delivery | delivery1@euphoria.com | Delivery@1234 |
| Support | support1@euphoria.com | Support@1234 |

---

## 15. Change Log (this checklist)

| Date | Action |
|------|--------|
| 2026-08-12 | Initial audit created from conversation_history.md, requirements docs, codebase grep, route inventory, browser homepage snapshot |

---

*Update this file after each fix session: change `[ ]` → `[~]` → `[x]` and add notes under Change Log.*
