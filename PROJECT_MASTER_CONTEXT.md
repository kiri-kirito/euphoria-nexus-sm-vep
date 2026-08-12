# Euphoria Nexus — Master Project Context

> **Last updated:** 2026-08-13 (Cursor session)  
> **Purpose:** Ei file porle kono AI assistant **full context** peye jabe — project ki, ki chaisi, ki ki hoise, kivabe hoise, ekhon ki baki, kothay deploy, ki manual step lagbe.  
> **Related docs:** `REQUIREMENTS_AND_PROCESS.md` (blueprint), `PROJECT_UPDATE.md` (older plan), `PROJECT_AUDIT_CHECKLIST.md` (bug tracker — partially outdated), `conversation_history.md` (full chat log: Anti Gravity + Cursor)

---

## 1. Project Overview

**Name:** Euphoria Nexus (SM-VEP)  
**Type:** Multi-vendor B2B/B2C e-commerce marketplace for **Bangladesh**  
**Constraint:** **100% free stack** — no paid APIs; mock payment gateway (UI only, validates amount → success)

### Five roles
| Role | Key capabilities |
|------|------------------|
| **Buyer** | Browse, cart, checkout, bulk negotiation, local sellers, wishlist, orders, complaints |
| **Seller** | Products CRUD, negotiations, blind stock bidding, cross-seller bundling, store settings |
| **Delivery Agent** | Online toggle, pick up / deliver orders, profile |
| **Support Agent** | Complaints, escrow, negotiation moderation, refunds |
| **Platform Admin** | Approve sellers, create agents, analytics, platform fees |

### Unique features (not generic e-commerce)
1. **Cross-Seller Bundling** — multiple sellers, one bundle, single delivery fee, profit split
2. **Bulk Order Negotiations** — MOQ+ → real-time chat → custom checkout link
3. **Local Seller Discovery** — PostGIS geolocation, same-day delivery opt-in
4. **Inter-Seller Stock Exchange** — blind bidding on stock requests → escrow

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS, Zustand |
| Backend (realtime) | Node.js + Express + Socket.io (`backend/server.js`) |
| Database | PostgreSQL on **Supabase** (PostGIS, RLS) |
| Auth | Supabase Auth (SSR, login modal in Navbar — no standalone login preferred) |
| Realtime | Supabase Realtime (dashboards) + Socket.io (chat, negotiations, bidding) |
| Maps | PostGIS + Leaflet (placeholder in delivery) |
| Deploy | **Vercel** (frontend), **Render** (backend) |

### Production URLs
- **Frontend:** https://euphoria-nexus-sm-vep.vercel.app
- **Backend:** https://euphoria-nexus-sm-vep.onrender.com
- **Supabase:** `zkezevgkanjfsvxhipuc.supabase.co`
- **GitHub:** `kiri-kirito/euphoria-nexus-sm-vep`
- **Local path:** `c:\Users\kirito\Downloads\SM-VEP`

### Env vars (critical)
**Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_URL=https://euphoria-nexus-sm-vep.onrender.com   # no trailing slash
```
`NEXT_PUBLIC_SOCKET_URL` optional — falls back to BACKEND_URL.

**Render (`backend/` root directory):**
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FRONTEND_URL=https://euphoria-nexus-sm-vep.vercel.app
NODE_ENV=production
PORT=10000
```

**Health check:** `https://euphoria-nexus-sm-vep.vercel.app/api/backend-health`

---

## 3. User Intent & Communication

- User communicates in **Benglish** (Bangla + English mix)
- Wants **real-world logical** marketplace — features interconnected, not isolated mocks
- **Vercel + Render production** must work
- **Real Supabase data** preferred over mock fallbacks
- **`git push origin`** when user explicitly asks (not automatic unless requested)
- **Do NOT implement `users.company`** — user declined (not in requirements)
- **Skip wallet/transaction history (#6)** — user explicitly skipped

---

## 4. Development Timeline (Summary)

### Phase A — Anti Gravity (Aug 7–9, 2026)
Full history in `conversation_history.md` (Steps 0–4793).

- Project analysis, tech stack, requirements doc (`REQUIREMENTS_AND_PROCESS.md`)
- Next.js UI for all 5 roles (initially mock-heavy)
- Supabase schema (`001_initial_schema.sql`), seed scripts
- Auth modal, RBAC, explore/catalog, checkout mock
- Many features claimed "complete" but relied on **mock fallbacks**

### Phase B — Cursor Audit (Aug 12, 2026 ~9:24 PM)
- Read all MD files + codebase audit
- Created **`PROJECT_AUDIT_CHECKLIST.md`**
- Verdict: ~55–65% demo-ready; mock fallbacks, schema mismatches, broken bundles

### Phase C — Serial Fixes + Deploy (Aug 12–13, 2026)
User instruction: fix serially, **commit after each fix**, keep Vercel in mind.

**Git commits on `origin/main` (newest first):**

| Commit | Summary |
|--------|---------|
| `ebbc9a2` | Negotiations checkout, chat DB, delivery portal, bidding/escrow, terms/privacy/support, migrations 005–007 |
| `baf488e` | Backend URL hardening, CORS, backend-health endpoint |
| `900f003` | Bundle cart + single delivery fee at checkout |
| `4a6ccc0` | Fix `/delivery` build fail → redirect in next.config |
| `79f3e14` | Supabase Realtime, admin mock removal |
| `c84f13e` | Profile real orders/negotiations, logout fix |
| `4173a4a` | Wishlist, about page, seller apply, local sellers PostGIS |
| `28f9458` | Seller bundling/settings, support tickets/moderation |
| `785887c` | Delivery pickup, bulk negotiations DB persist |
| `8075895` | Seller bidding/negotiations, explore, Vercel images |
| `46b6ac4` | Checkout + bundles real Supabase data |
| `6ca1886` | Schema fixes migration, bundle seed, audit checklist |

### Phase D — Session 3 (Aug 13, ~2:27 AM) — **LOCAL ONLY, NOT PUSHED**
User: skip #6 wallet, do rest of plan.

| Done | Files / notes |
|------|---------------|
| Product images | `src/utils/productImages.ts`, `src/components/products/ProductImage.tsx` |
| Mock removal | Explore hardcoded PRODUCTS deleted, `DbErrorBanner`, `fetchLocalSellers` no fake fallback |
| Chat real contacts | `GlobalChatWidget.tsx` — support, sellers/buyers from orders/negotiations/complaints |
| Return/refund | `orders/page.tsx`, support ticket refund, `008_complaints_refund.sql` |
| Cleanup | Deleted `ProductGrid.tsx`, `FilterSidebar.tsx`; checklist changelog |

**User must run in Supabase (if not done):** `backend/migrations/008_complaints_refund.sql`

---

## 5. Database Migrations (Run Order)

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Base schema, PostGIS, RLS |
| `002_schema_additions.sql` | Additions |
| `003_schema_fixes.sql` | escrow, negotiations cols, `get_sellers_within_radius` RPC |
| `004_wishlists.sql` | Wishlists table |
| `005_chat_messages.sql` | Chat persistence (**use DROP POLICY + CREATE POLICY**, not IF NOT EXISTS**) |
| `006_stores_bids_policies.sql` | Seller apply + bid RLS |
| `007_bundle_policies.sql` | Bundle create RLS |
| `008_complaints_refund.sql` | Complaint types, refund columns (**Session 3 — may need run**) |

**Post-seed location sync (after `seed_store_locations.js`):**
```sql
UPDATE stores SET location = ST_SetSRID(ST_MakePoint(
  (settings->>'lng')::float, (settings->>'lat')::float
), 4326)
WHERE settings->>'lat' IS NOT NULL AND location IS NULL;
```

**Seed scripts:** `backend/seed.js`, `seed_bundles.js`, `seed_store_locations.js`

---

## 6. Test Accounts (Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@euphoria.com | Admin@1234 |
| Seller | seller1@euphoria.com | Seller@1234 |
| Buyer | buyer1@euphoria.com | Buyer@1234 |
| Delivery | delivery1@euphoria.com | Delivery@1234 |
| Support | support1@euphoria.com | Support@1234 |

---

## 7. Key Implementation Files

| Path | Purpose |
|------|---------|
| `src/utils/api.ts` | Supabase data layer (local sellers, products, etc.) |
| `src/utils/backendUrl.ts` | Single source for Render backend URL |
| `src/app/(public)/checkout/page.tsx` | Checkout + `/checkout?negotiation=<id>` |
| `src/components/chat/GlobalChatWidget.tsx` | Chat UI + DB history + real contacts |
| `backend/server.js` | Socket.io: negotiations, bidding, chat persist |
| `backend/lib/supabase.js` | Service role client for backend writes |
| `next.config.ts` | Redirects: `/delivery`, `/local`, `/agent/apply`; Supabase image host |
| `PROJECT_AUDIT_CHECKLIST.md` | Bug/feature tracker (needs sync with code) |

---

## 8. What Works Today (Production @ `ebbc9a2`)

- Auth + RBAC via Navbar modal
- Explore catalog from DB, filters, geolocation nearby
- Product detail, cart, checkout with payments/deliveries
- Bundles: homepage → bundle page → single delivery fee
- Wishlist, about, terms/privacy/support pages
- Seller: products, negotiations, bidding, bundling, settings → stores
- Buyer: profile orders/negotiations, negotiation checkout link
- Delivery: dashboard, online toggle, real orders, profile
- Support: tickets, escrow, moderation, refund on ticket
- Admin: dashboard, agent leaderboards, seller approval
- Chat messages persist to DB (migration 005 + Render service key)
- Backend health: Vercel ↔ Render connected

---

## 9. What Is Still Remaining

### High priority
| # | Item | Notes |
|---|------|-------|
| 1 | **Push Session 3 changes** | Uncommitted local work — user must ask to commit/push |
| 2 | **Run migration 008** | Return/refund flow in Supabase |
| 3 | **Socket.io authentication** | Anyone can emit on namespaces today |
| 4 | **PROJECT_AUDIT_CHECKLIST sync** | Many `[ ]` items actually done in code |

### Medium / polish
| # | Item |
|---|------|
| 5 | Push notifications (navbar badge UI only) |
| 6 | Delivery map view (Leaflet placeholder) |
| 7 | Cross-seller bundle multi-pickup routing for agents |
| 8 | Dedicated delivery agent apply flow |
| 9 | Register page vs modal-only auth (requirements say modal) |
| 10 | Explore filter sidebar layout verify |

### Explicitly skipped / declined
- **Wallet / transaction history** — user said skip (#6)
- **`users.company` column** — user declined
- TanStack Query, React Three Fiber 3D — requirements edge, not implemented

---

## 10. Rules for Next Assistant

1. Read **`AGENTS.md`**, **`REQUIREMENTS_AND_PROCESS.md`**, and **this file** before big changes
2. Read **`node_modules/next/dist/docs/`** before Next.js code — this is Next.js 16 with breaking changes
3. Prefer **real DB data**; use `DbErrorBanner` instead of silent mock fallbacks
4. **Commit/push only when user asks**
5. After fixes: verify build (`npm run build`), check production health if deploy-related
6. User wants Benglish replies
7. SQL policies: use `DROP POLICY IF EXISTS` + `CREATE POLICY` (PostgreSQL)

---

## 11. How Features Connect (Logic Map)

```
Buyer browse (explore) → product detail → cart → checkout → orders + payments + deliveries
                              ↓ MOQ met
                         BulkDealModal → Socket.io → negotiations table
                              ↓ accepted
                         /checkout?negotiation=id → order → delivery agent pickup

Seller stock low → post stock_request → blind bids (stock_bids) → accept → escrow
Seller + Seller → product_bundles → buyer bundle page → single delivery fee

Buyer geolocation → get_sellers_within_radius RPC → filtered explore / homepage local sellers

Complaint/return/refund → complaints table → support ticket → refund updates order + payment
Chat → Socket.io + chat_messages table → GlobalChatWidget loads history + real contacts
```

---

## 12. Conversation History

Full user ↔ AI transcript:
- **Anti Gravity session (Aug 7–9):** `conversation_history.md` lines 1–4355
- **Cursor session (Aug 12–13):** `conversation_history.md` section appended at end — "Cursor AI Session"

For raw JSONL transcript:  
`C:\Users\kirito\.cursor\projects\c-Users-kirito-Downloads-SM-VEP\agent-transcripts\431708c8-8cc4-4b38-a4cf-d91487c2c44f\431708c8-8cc4-4b38-a4cf-d91487c2c44f.jsonl`

---

## 13. Immediate Next Steps (Suggested)

1. User runs `008_complaints_refund.sql` in Supabase
2. User asks to **commit + push** Session 3 → Vercel redeploy
3. Sync `PROJECT_AUDIT_CHECKLIST.md` with actual code state
4. Socket.io auth (if security/demo hardening needed)
5. Browser E2E pass on production after Session 3 deploy
