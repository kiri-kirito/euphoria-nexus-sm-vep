# Euphoria Nexus Dummy Data & Seeding Strategy

For faculty presentation and testing purposes, the platform must be pre-populated with robust dummy data to demonstrate features like Local Seller Discovery, Bulk Negotiation, and Bundles.

## 1. Data Targets
- **Sellers:** Minimum 50 unique sellers with verified store profiles and realistic geolocation coordinates (spread around a target city, e.g., Dhaka, to test the radius search).
- **Products:** Minimum 100 unique products spread across the 50 sellers (average 2-3 products per seller). We will ensure some product types overlap (e.g., multiple sellers selling identical "Wireless Mouse" models) to demonstrate the Inter-Seller Stock Exchange bidding system.
- **Other Roles:** 5 Buyers, 5 Delivery Agents, 2 Support Agents, and 1 Admin for login testing.

## 2. Image Handling Strategy

### For Dummy Data (Seeding)
We will use free, reliable image placeholder services that return realistic images based on categories, preventing the need to manually download and store 100 images.
- **Products Service:** `https://placehold.co/` or UI Avatars.
- **Example:** A product image URL stored in the database will look like: `https://placehold.co/600x400/png?text=Wireless+Mouse`.
- **User Avatars:** `https://ui-avatars.com/api/?name=Seller+Name`.

### For Real Usage (New Sellers Adding Products)
When a real user signs up and adds a product during the demo:
- **Service:** **Supabase Storage** (Provides a generous free tier for storing media).
- **Process:** The frontend uploads the image file to a Supabase Storage bucket (e.g., `product-images`). Supabase returns a public URL, which our Express.js backend then saves into the PostgreSQL `products` table in the `images` JSONB column.

## 3. Automated Seeding Approach
Instead of manually typing SQL inserts or creating accounts one by one, we will create a **Node.js Seed Script** using `Faker.js`.
- `faker.js` will generate random but realistic names, emails, descriptions, prices, and coordinates.
- The script will connect directly to our PostgreSQL database and insert the 50 sellers and 100 products in a few seconds.
- This script can be run anytime before a presentation to reset the database to a perfect demo state.

## 4. Example Seed Data Structure (JSON Representation)

### Example Seller Object
```json
{
  "name": "Tech Haven BD",
  "email": "seller1@demo.com",
  "role": "seller",
  "store": {
    "store_name": "Tech Haven Official",
    "is_approved": true,
    "location": { "lat": 23.8103, "lng": 90.4125 }
  }
}
```

### Example Product Object
```json
{
  "name": "Logitech G Pro Wireless",
  "seller_id": "UUID-of-Seller-1",
  "price": 12000,
  "quantity": 15,
  "category": "Electronics",
  "images": ["https://placehold.co/600x400/png?text=Logitech+Mouse"]
}
```

### Example Delivery Agent Object (Internal Account)
```json
{
  "name": "Robiul Islam",
  "email": "agent1@platform.com",
  "role": "delivery_agent",
  "agent_profile": {
    "is_available": true,
    "current_location": { "lat": 23.8105, "lng": 90.4120 },
    "vehicle_type": "Motorcycle"
  }
}
```
