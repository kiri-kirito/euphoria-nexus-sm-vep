# Euphoria Nexus — Master Requirements & Application Blueprint

This document consolidates the Use Cases, Functional/Non-Functional Requirements, UI Layout, Data Models, and detailed feature logic into a single build-ready specification.

## Step 1: Tech Stack & Architecture
- **Frontend:** Next.js (React), Tailwind CSS, Zustand, TanStack Query
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Hosted on Supabase/Neon)
- **Authentication & Storage:** Supabase Auth & Supabase Storage (100% Free tier)
- **Real-time:** Socket.io (Negotiations, Notifications, Stock Bidding)
- **Maps/Geo:** PostGIS (PostgreSQL) + OpenStreetMap + Leaflet.js
- **Deployment:** Vercel/Netlify (Frontend), Render (Backend)

## Step 2: Platform Actors (5 Roles)
- **Buyer:** Browses, orders, negotiates bulk prices, tracks deliveries, finds nearby sellers.
- **Seller:** Lists products, manages inventory, fulfills orders, joins bundles, bids on stock requests.
- **Delivery Agent:** Accepts shipments, updates transit status, sets availability.
- **Support Agent:** Resolves complaints, moderates deadlocked negotiations.
- **Platform Admin (Superuser):** Full oversight of the platform. Approves Sellers, creates internal accounts (Agents), manages user access/bans, configures platform fees, monitors financial reports (GMV, revenue), and reviews system activity logs.

## Step 3: Full Site Map & UI Layout
### 3.1 Global Components
- **Navbar (Sticky):** Logo (Left), Categories/Search/Nearby (Center), Cart/Notifications/Profile (Right).
- **Footer:** Company Info, Customer Service, Legal, Socials.

### 3.2 Buyer / Guest View (`app/(public)` & `app/(buyer)`)
- **Homepage (`/`):** Hero carousel, "Sellers Near You", Featured Bundles, Daily Deals.
- **Catalog (`/products`):** Sidebar filters (category, price, distance). Grid view.
- **Product Detail (`/product/[id]`):** Gallery, stock count, Add to Cart, "Negotiate Bulk" (if MOQ met).
- **Checkout:** Address -> Bulk Negotiation Panel -> Payment (Mock UI) -> Confirmation.
- **Account:** Order tracking (live map), history, wishlist, complaints.

### 3.3 Role-Specific Dashboards
- **Seller (`app/(seller)`):** Analytics, CRUD products, inventory, stock requests (bidding board), order fulfillment.
- **Delivery Agent (`app/(agent)`):** Availability toggle, assigned deliveries, status updates (Picked Up -> In Transit -> Delivered).
- **Support Agent (`app/(support)`):** Complaints queue, negotiation moderation.
- **Admin (`app/(admin)`):** User Management (approve sellers, create agents, ban users), Financials (platform revenue, commission logs), Platform Settings (fee config, category management), and System Analytics (activity logs, GMV).

## Step 4: Core Functional Requirements (FR)
- **FR-1 Accounts:** JWT log in/out, profile edits. 
  - *Registration Logic:* Buyers and Sellers can register themselves (Sellers need Admin approval). Delivery Agents, Support Agents, and Admins **cannot** register publicly; their accounts are created internally by the Platform Admin after a hiring/interview process.
  - *Status:* Agent availability toggle (online/offline).
- **FR-2 Products:** Sellers manage catalogs and inventory.
- **FR-3 Orders:** Buyer browses, adds to cart, uses Mock Payment (simulated UI verifying amounts), Seller updates status, Agent delivers, Buyer tracks.
- **FR-4 Disputes & Logs:** Support investigates complaints. Users view notifications and wallet logs. Admin configures fees.

## Step 5: Advanced Custom Features & Logic

### 5.1 Cross-Seller Bundling
Two or more sellers collaborate to offer a combined product bundle at a discounted rate. Profit is split automatically based on pre-agreed percentages.
- **Delivery Fee Logic:** The buyer pays a **single delivery fee**. The platform's routing algorithm will assign a delivery agent to pick up items from both sellers (if geographically viable) or consolidate them at a local hub before final delivery.
- **Return Policy Logic:** If a buyer returns only one item from a bundle, the "bundle discount" is voided. The refund amount will be: `Total Bundle Price Paid - (Original Price of the Kept Item)`.
- **Code/Tech:** PostgreSQL Transactions (to ensure either all splits happen or none), complex routing algorithm for delivery.
- **Limitations:** Multi-pickup for a single order increases the delivery agent's workload and time.

### 5.2 Bulk Order Negotiations
Buyers ordering large quantities can negotiate prices directly with sellers.
- **Logic:** A seller sets a "Minimum Order Quantity (MOQ)" for a product. If a buyer selects that quantity or higher, a "Negotiate" button appears.
- **Process:** Clicking triggers a real-time chatbox. Buyer proposes a price, Seller can counter-offer. Once agreed, the Seller generates a "Custom Checkout Link" directly in the chat.
- **Code/Tech:** Socket.io for real-time chat, unique token generation for custom checkout links.
- **Limitations:** Requires sellers to be online or responsive to not lose bulk deals.

### 5.3 Local Seller Discovery & Same-Day Delivery
Buyers can find nearby sellers for faster delivery.
- **Logic:** 
  1. Sellers must "opt-in" to the *Same-Day Delivery* program in their settings.
  2. Buyers can toggle a "Fast/Local Delivery" filter on the search page.
  3. The system matches the buyer's coordinates with opted-in sellers within a specific radius (e.g., 5km).
  4. Once ordered, a local Delivery Agent gets a priority ping to pick up and drop off point-to-point (bypassing the main hub).
- **Code/Tech:** PostGIS extension in PostgreSQL for geospatial queries (calculating distances between coordinates).
- **Limitations:** Only works well in high-density urban areas where buyers, sellers, and delivery agents are close to each other.

### 5.4 Inter-Seller Stock Exchange (Blind Bidding System)
Sellers running out of stock can source products from other sellers on the platform anonymously.
- **Logic:**
  1. **Post Request:** Seller A posts a request (e.g., "Need 50 units of Product X, Target Price $10").
  2. **Blind Bidding:** Other sellers (B, C) who sell Product X see the board. They submit their offers.
  3. **Privacy:** Bidders cannot see each other's bids. A bidder can only submit *one* offer (no changing to avoid manipulation).
  4. **Acceptance:** Seller A reviews offers and clicks "Accept" on C's offer. The post is removed from the board, and a private chat opens between A and C.
  5. **Fulfillment Options:** They agree on either *Dropshipping* (C ships directly to A's buyer) or *Bulk Transfer* (Delivery Agent moves stock from C to A).
  6. **Escrow:** Payment is held in the system (Support Agent oversees) until stock transfer is confirmed.
- **Code/Tech:** Real-time updates (Socket.io) for the bid board. Escrow state management in the database.
- **Limitations:** Platform must ensure the quality of products exchanged between sellers remains consistent to protect the final buyer.

## Step 6: Non-Functional Requirements (NFR)
- **Operational:** Web-based cloud hosting. Tenant data isolation (seller scopes).
- **Performance:** Catalogs load < 3s. Real-time updates reflect < 5s via WebSockets.
- **Security:** Unique passwords, RBAC API guards, strict delivery agent scoping.

## Step 7: Data Model (PostgreSQL Schema)
- **users:** `id`, `name`, `email`, `password_hash`, `phone`, `address`, `role` (ENUM: buyer, seller, agent, support, admin).
- **stores:** `user_id` (FK), `store_name`, `settings` (JSONB), `is_approved`, `location` (Point).
- **products:** `id`, `seller_id` (FK), `name`, `description`, `price`, `quantity`, `category`, `images` (JSONB).
- **product_bundles:** `id`, `bundle_name`, `total_price`, `revenue_split` (JSONB mapping).
- **bundle_items:** `bundle_id` (FK), `product_id` (FK).
- **stock_requests:** `id`, `requesting_seller_id` (FK), `product_id` (FK), `quantity`, `target_price`, `status`.
- **stock_bids:** `id`, `request_id` (FK), `bidding_seller_id` (FK), `bid_price`, `status`. *(Blind Bidding)*.
- **orders:** `id`, `buyer_id` (FK), `total_amount`, `status`, `shipping_address`.
- **order_items:** `id`, `order_id` (FK), `product_id` (FK), `seller_id` (FK), `quantity`, `unit_price`.
- **deliveries:** `id`, `order_id` (FK), `agent_id` (FK), `pickup_address`, `delivery_address`, `status`, `estimated_time`.
- **payments:** `id`, `order_id` (FK), `amount`, `status`, `transaction_id`.
- **negotiations:** `id`, `buyer_id` (FK), `seller_id` (FK), `product_id` (FK), `current_price`, `status`.
- **complaints:** `id`, `buyer_id` (FK), `order_id` (FK), `description`, `status`, `resolution`.
