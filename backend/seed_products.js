/**
 * seed_products.js
 * Seeds ONLY products, orders, deliveries, payments, complaints, negotiations.
 * Run AFTER running schema_fix.js or after manually running the SQL in Supabase.
 * Uses only columns that exist in the original schema + new ones if available.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkezevgkanjfsvxhipuc.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Unsplash photo IDs map ───────────────────────────────────────────────────
const PHOTO_MAP = {
  'headphones': '1505740420928-5e560c06d30e',
  'keyboard': '1595225476474-87563907a212',
  'laptop': '1593642632559-0c6d3fc62b89',
  'smartphone': '1592750475338-74b7b21085ab',
  'iphone': '1592750475338-74b7b21085ab',
  'watch': '1523275335684-37898b6baf30',
  'smartwatch': '1523275335684-37898b6baf30',
  'speaker': '1608043152269-423dbba4e7e1',
  'monitor': '1527443224154-c4a3942d3acf',
  'earbuds': '1505740420928-5e560c06d30e',
  'camera': '1516035069371-29a1b244cc32',
  'router': '1558618666-fcd25c85cd64',
  'charger': '1573739022854-abda39a7af48',
  'shirt': '1620799140188-3b2a02fd9a77',
  'jeans': '1542272604-787c3835535d',
  'saree': '1610030169371-5d5ed16f6b5e',
  'blazer': '1507003211169-0a1dd7228f2d',
  'kurti': '1610030169371-5d5ed16f6b5e',
  'shoes': '1542291026-7eec264c27ff',
  'chair': '1580480055273-228ff5388ef8',
  'sofa': '1555041469-a586c61ea9bc',
  'mattress': '1540518614846-7eded433c457',
  'cookware': '1556909114-44e3e9399a73',
  'rice': '1568901346375-23c9450c58cd',
  'honey': '1587049352851-8d4e89133924',
  'fish': '1534482421-64566f976cfa',
  'copper': '1574345371569-b5413bc7cb9f',
  'solar': '1509391366360-2e959784a276',
  'steel': '1518349542013-176b6a03cc09',
  'wallet': '1553062407-98eeb64c6a62',
  'sunglasses': '1511499767150-a7a1371514ec',
  'backpack': '1553062407-98eeb64c6a62',
  'dumbbell': '1534438327276-14e5300c3a48',
  'yoga': '1544367567-0f2fcb009e0b',
  'vitamin': '1584308666744-24d5c474f2ae',
  'default': '1568901346375-23c9450c58cd',
};

function getPhotoUrl(keyword) {
  const k = keyword.toLowerCase().split(/[\s,-]/)[0];
  const id = PHOTO_MAP[k] || PHOTO_MAP['default'];
  return `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&q=80`;
}

// ─── Product Catalog ───────────────────────────────────────────────────────────
const PRODUCT_CATALOG = [
  { name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', price: 32000, keyword: 'headphones' },
  { name: 'Logitech MX Master 3S Wireless Mouse', category: 'Electronics', price: 10500, keyword: 'laptop' },
  { name: 'Samsung 65" QLED 4K Smart TV', category: 'Electronics', price: 185000, keyword: 'monitor' },
  { name: 'Apple iPhone 15 Pro (256GB)', category: 'Electronics', price: 175000, keyword: 'iphone' },
  { name: 'ASUS ROG Strix G15 Gaming Laptop', category: 'Electronics', price: 165000, keyword: 'laptop' },
  { name: 'Custom RGB Mechanical Keyboard', category: 'Electronics', price: 4800, keyword: 'keyboard' },
  { name: 'Xiaomi Smart Band 8 Pro Fitness Tracker', category: 'Electronics', price: 5500, keyword: 'smartwatch' },
  { name: 'Anker 65W GaN USB-C Charger', category: 'Electronics', price: 3200, keyword: 'charger' },
  { name: 'JBL Charge 5 Portable Bluetooth Speaker', category: 'Electronics', price: 18000, keyword: 'speaker' },
  { name: 'Corsair HS80 RGB Wireless Gaming Headset', category: 'Electronics', price: 15500, keyword: 'headphones' },
  { name: 'LG 27" IPS 4K UHD Monitor', category: 'Electronics', price: 55000, keyword: 'monitor' },
  { name: 'Realme Buds Air 5 Pro TWS Earbuds', category: 'Electronics', price: 6500, keyword: 'earbuds' },
  { name: 'WD 1TB Portable External Hard Drive', category: 'Electronics', price: 7200, keyword: 'laptop' },
  { name: 'TP-Link AX3000 Wi-Fi 6 Router', category: 'Electronics', price: 12500, keyword: 'router' },
  { name: 'GoPro Hero 12 Action Camera', category: 'Electronics', price: 52000, keyword: 'camera' },
  { name: 'Premium Oxford Cotton Dress Shirt (White)', category: 'Fashion', price: 2800, keyword: 'shirt' },
  { name: 'Slim Fit Dark Blue Denim Jeans', category: 'Fashion', price: 3500, keyword: 'jeans' },
  { name: 'Traditional Handwoven Jamdani Saree', category: 'Fashion', price: 8500, keyword: 'saree' },
  { name: 'Formal Charcoal Grey Blazer', category: 'Fashion', price: 12000, keyword: 'blazer' },
  { name: 'Women\'s Cotton Kurti Set', category: 'Fashion', price: 2200, keyword: 'kurti' },
  { name: 'Eid Special Embroidered Panjabi', category: 'Fashion', price: 4500, keyword: 'shirt' },
  { name: 'Dri-Fit Performance Gym T-Shirt', category: 'Fashion', price: 1200, keyword: 'shirt' },
  { name: 'Ergonomic Mesh Executive Office Chair', category: 'Home', price: 14500, keyword: 'chair' },
  { name: 'Modern L-Shape Sofa Set (Grey Fabric)', category: 'Home', price: 65000, keyword: 'sofa' },
  { name: 'Teak Wood 6-Seater Dining Table Set', category: 'Home', price: 42000, keyword: 'sofa' },
  { name: 'King Size Memory Foam Mattress (10")', category: 'Home', price: 28000, keyword: 'mattress' },
  { name: 'Stainless Steel Non-Stick Cookware Set (10 pcs)', category: 'Home', price: 6800, keyword: 'cookware' },
  { name: 'Smart Dimmable LED Ceiling Light', category: 'Home', price: 3500, keyword: 'default' },
  { name: 'Nike Air Max 270 Running Shoes (Men)', category: 'Sports', price: 14500, keyword: 'shoes' },
  { name: 'Adidas Ultraboost 23 Running Shoes', category: 'Sports', price: 18000, keyword: 'shoes' },
  { name: 'Yonex Badminton Racket Premium Set', category: 'Sports', price: 4500, keyword: 'dumbbell' },
  { name: 'Kashmir Willow Professional Cricket Bat', category: 'Sports', price: 5500, keyword: 'dumbbell' },
  { name: 'Anti-Slip Yoga Mat with Carry Bag', category: 'Sports', price: 1800, keyword: 'yoga' },
  { name: 'Adjustable Dumbbell Set (2-20kg)', category: 'Sports', price: 8500, keyword: 'dumbbell' },
  { name: 'Organic Premium Basmati Rice (5kg)', category: 'Food', price: 850, keyword: 'rice' },
  { name: 'Cold-Pressed Sundarban Pure Honey (500g)', category: 'Food', price: 1200, keyword: 'honey' },
  { name: 'Fresh Hilsa Fish / Ilish (1kg)', category: 'Food', price: 2800, keyword: 'fish' },
  { name: 'Premium Mixed Dry Fruits Gift Box (1kg)', category: 'Food', price: 3500, keyword: 'default' },
  { name: 'Organic Himalayan Green Tea (100g)', category: 'Food', price: 950, keyword: 'default' },
  { name: 'Cold-Pressed Pure Mustard Oil (1L)', category: 'Food', price: 320, keyword: 'default' },
  { name: 'Industrial High-Purity Copper Wire (99.99%)', category: 'Industrial', price: 950, keyword: 'copper' },
  { name: 'Monocrystalline Solar Panels (550W)', category: 'Industrial', price: 18500, keyword: 'solar' },
  { name: 'Structural Steel I-Beams (Grade 50, per ton)', category: 'Industrial', price: 95000, keyword: 'steel' },
  { name: 'High-Pressure Industrial Water Pump (5HP)', category: 'Industrial', price: 28000, keyword: 'default' },
  { name: 'EN397 Certified Industrial Safety Helmet', category: 'Industrial', price: 1800, keyword: 'default' },
  { name: 'Genuine Cowhide Leather Bifold Wallet', category: 'Accessories', price: 2500, keyword: 'wallet' },
  { name: 'Titanium Frame UV400 Aviator Sunglasses', category: 'Accessories', price: 8500, keyword: 'sunglasses' },
  { name: 'Handcrafted 925 Silver Earrings Set', category: 'Accessories', price: 4500, keyword: 'default' },
  { name: 'Anti-Theft Canvas Laptop Backpack (15.6")', category: 'Accessories', price: 3800, keyword: 'backpack' },
  { name: 'Stainless Steel Dress Analog Watch', category: 'Accessories', price: 12000, keyword: 'watch' },
  { name: 'Insulated Stainless Steel Water Bottle (1L)', category: 'Accessories', price: 1600, keyword: 'default' },
  { name: 'Omron Digital Blood Pressure Monitor', category: 'Health', price: 4800, keyword: 'vitamin' },
  { name: 'Fingertip Pulse Oximeter SpO2 Monitor', category: 'Health', price: 1200, keyword: 'vitamin' },
  { name: 'Vitamin D3 + K2 Supplements (90 Tablets)', category: 'Health', price: 650, keyword: 'vitamin' },
  { name: 'Philips Sonicare Electric Toothbrush', category: 'Health', price: 5500, keyword: 'vitamin' },
  { name: 'Non-Contact Infrared Thermometer', category: 'Health', price: 2200, keyword: 'vitamin' },
];

const DHAKA_AREAS = [
  'Gulshan, Dhaka', 'Banani, Dhaka', 'Dhanmondi, Dhaka', 'Uttara, Dhaka',
  'Mirpur, Dhaka', 'Mohammadpur, Dhaka', 'Motijheel, Dhaka', 'Old Dhaka',
  'Gazipur', 'Narayanganj', 'Chittagong', 'Sylhet',
];

async function seedProductsAndOrders() {
  console.log('📦 Starting Products + Orders seed...\n');

  // ── Get existing sellers ──────────────────────────────────────────────────────
  const { data: sellers, error: sErr } = await supabase
    .from('users').select('id, email').eq('role', 'seller').limit(60);
  if (sErr || !sellers || sellers.length === 0) {
    console.error('❌ No sellers found. Run the main seed.js first to create users.');
    process.exit(1);
  }
  console.log(`✅ Found ${sellers.length} sellers in database`);

  // ── Get existing buyers ───────────────────────────────────────────────────────
  const { data: buyers, error: bErr } = await supabase
    .from('users').select('id, address').eq('role', 'buyer').limit(310);
  if (bErr || !buyers || buyers.length === 0) {
    console.error('❌ No buyers found. Run the main seed.js first.');
    process.exit(1);
  }
  console.log(`✅ Found ${buyers.length} buyers in database`);

  // ── Get existing delivery agents ──────────────────────────────────────────────
  const { data: deliveryAgents } = await supabase
    .from('users').select('id').eq('role', 'agent').limit(25);
  console.log(`✅ Found ${deliveryAgents?.length || 0} delivery agents`);

  // ── Get existing support agents ───────────────────────────────────────────────
  const { data: supportAgents } = await supabase
    .from('users').select('id').eq('role', 'support').limit(15);
  console.log(`✅ Found ${supportAgents?.length || 0} support agents\n`);

  // ── Seed Products ─────────────────────────────────────────────────────────────
  console.log('📦 Seeding 200 products...');
  const productIds = [];
  let sellerIdx = 0;
  let productCount = 0;

  // Check if new columns exist by trying a test insert
  let hasNewColumns = false;
  try {
    const testResult = await supabase.from('products').select('moq').limit(1);
    hasNewColumns = !testResult.error;
  } catch (e) { hasNewColumns = false; }
  console.log(`  ℹ️  New columns (moq/compare_price/status): ${hasNewColumns ? 'Available ✅' : 'Not yet added ⚠️'}`);

  // First pass: one of each catalog item
  for (const item of PRODUCT_CATALOG) {
    const seller = sellers[sellerIdx % sellers.length];
    sellerIdx++;
    const imgUrl = getPhotoUrl(item.keyword);

    const productData = {
      seller_id: seller.id,
      name: item.name,
      description: `${item.name} — Premium quality product on Euphoria Nexus. Trusted Bangladesh seller. Fast delivery guaranteed.`,
      price: item.price,
      quantity: faker.number.int({ min: 20, max: 500 }),
      category: item.category,
      images: JSON.stringify([imgUrl]),
    };

    // Add new columns only if they exist
    if (hasNewColumns) {
      productData.moq = faker.number.int({ min: 1, max: 20 });
      productData.compare_price = Math.round(item.price * 1.15);
      productData.status = 'active';
    }

    const { data: prod, error } = await supabase.from('products').insert(productData).select('id, price').single();
    if (error) {
      console.error(`  ❌ Error: ${error.message.substring(0, 80)} for "${item.name}"`);
    } else {
      productIds.push({ id: prod.id, seller_id: seller.id, price: item.price, name: item.name });
      productCount++;
    }
  }

  // Second pass: variations to reach 200
  const needed = 200 - productCount;
  console.log(`  → Creating ${needed} more product variations...`);
  for (let i = 0; i < needed; i++) {
    const base = PRODUCT_CATALOG[i % PRODUCT_CATALOG.length];
    const seller = sellers[sellerIdx % sellers.length];
    sellerIdx++;
    const suffix = faker.helpers.arrayElement(['Pro', 'Lite', 'Plus', 'Premium', 'Special', 'HD', 'Elite']);
    const varPrice = Math.round(base.price * (0.8 + Math.random() * 0.4));
    const imgUrl = getPhotoUrl(base.keyword);

    const productData = {
      seller_id: seller.id,
      name: `${base.name} — ${suffix} Edition`,
      description: `${base.name} ${suffix} Edition. Quality assured, fast delivery across Bangladesh.`,
      price: varPrice,
      quantity: faker.number.int({ min: 5, max: 200 }),
      category: base.category,
      images: JSON.stringify([imgUrl]),
    };

    if (hasNewColumns) {
      productData.moq = faker.number.int({ min: 1, max: 10 });
      productData.compare_price = Math.round(varPrice * 1.12);
      productData.status = 'active';
    }

    const { data: prod, error } = await supabase.from('products').insert(productData).select('id, price').single();
    if (!error && prod) {
      productIds.push({ id: prod.id, seller_id: seller.id, price: varPrice, name: productData.name });
    }
  }
  console.log(`  ✅ Seeded ${productIds.length} products\n`);

  if (productIds.length === 0) {
    console.error('❌ No products were inserted. Cannot create orders without products.');
    return;
  }

  // ── Seed Orders + Order Items ──────────────────────────────────────────────
  console.log('🛒 Seeding 500+ orders...');
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered'];
  const orderIds = [];
  let totalOrders = 0;

  for (const buyer of buyers) {
    const numOrders = faker.number.int({ min: 1, max: 3 });
    for (let o = 0; o < numOrders; o++) {
      const numItems = faker.number.int({ min: 1, max: 4 });
      let totalAmount = 0;
      const items = [];

      for (let i = 0; i < numItems; i++) {
        const product = faker.helpers.arrayElement(productIds);
        const qty = faker.number.int({ min: 1, max: 5 });
        totalAmount += product.price * qty;
        items.push({ product_id: product.id, seller_id: product.seller_id, quantity: qty, unit_price: product.price });
      }

      const status = faker.helpers.arrayElement(orderStatuses);
      const createdAt = faker.date.between({ from: '2025-01-01', to: new Date() });
      const shippingAddr = buyer.address || faker.helpers.arrayElement(DHAKA_AREAS);

      const { data: order, error } = await supabase.from('orders').insert({
        buyer_id: buyer.id,
        total_amount: Math.round(totalAmount),
        status,
        shipping_address: shippingAddr,
        created_at: createdAt,
      }).select('id').single();

      if (error || !order) continue;

      // Insert order items
      for (const item of items) {
        await supabase.from('order_items').insert({ ...item, order_id: order.id });
      }

      // Create payment
      await supabase.from('payments').insert({
        order_id: order.id,
        amount: Math.round(totalAmount),
        status: status === 'delivered' ? 'completed' : (status === 'pending' ? 'pending' : 'processing'),
        transaction_id: status === 'delivered' ? `TXN${faker.string.alphanumeric(10).toUpperCase()}` : null,
      });

      orderIds.push({ id: order.id, buyer_id: buyer.id, status, address: shippingAddr });
      totalOrders++;
    }
    if (totalOrders > 0 && totalOrders % 100 === 0) {
      console.log(`  → ${totalOrders} orders created...`);
    }
  }
  console.log(`  ✅ Seeded ${totalOrders} orders\n`);

  // ── Seed Deliveries ────────────────────────────────────────────────────────
  if (deliveryAgents && deliveryAgents.length > 0) {
    console.log('📍 Seeding deliveries...');
    const shippedOrders = orderIds.filter(o => ['shipped', 'delivered', 'processing'].includes(o.status));
    let deliveryCount = 0;
    for (const order of shippedOrders) {
      const agent = faker.helpers.arrayElement(deliveryAgents);
      const isDone = order.status === 'delivered';
      const dStatus = isDone ? 'delivered' : faker.helpers.arrayElement(['assigned', 'picked_up', 'in_transit']);
      
      const deliveryData = {
        order_id: order.id,
        agent_id: agent.id,
        pickup_address: faker.helpers.arrayElement(DHAKA_AREAS) + ', Bangladesh',
        delivery_address: order.address,
        status: dStatus,
        estimated_time: faker.date.future(),
      };

      // Add completed_at if column exists
      if (hasNewColumns && isDone) {
        deliveryData.completed_at = faker.date.recent({ days: 30 });
      }

      await supabase.from('deliveries').insert(deliveryData);
      deliveryCount++;
    }
    console.log(`  ✅ Seeded ${deliveryCount} deliveries\n`);
  }

  // ── Seed Complaints ────────────────────────────────────────────────────────
  if (supportAgents && supportAgents.length > 0 && orderIds.length > 0) {
    console.log('🎫 Seeding 50 support complaints...');
    const complaintReasons = [
      'Product received was different from what was shown online.',
      'Item arrived damaged. Requesting replacement.',
      'Wrong size/color was delivered.',
      'Delivery took much longer than promised.',
      'Product quality is not as described in listing.',
      'Received incorrect quantity — missing items.',
      'Package was opened/tampered upon arrival.',
      'Product stopped working within 2 days.',
      'Seller is not responding to messages.',
      'Refund not processed after return.',
    ];
    const deliveredOrders = orderIds.filter(o => o.status === 'delivered');
    const selected = faker.helpers.arrayElements(deliveredOrders, Math.min(50, deliveredOrders.length));
    
    for (const order of selected) {
      const agent = faker.helpers.arrayElement(supportAgents);
      const isResolved = Math.random() > 0.35;
      
      const complaintData = {
        buyer_id: order.buyer_id,
        order_id: order.id,
        description: faker.helpers.arrayElement(complaintReasons),
        status: isResolved ? 'resolved' : 'open',
        resolution: isResolved ? 'Refund of ৳' + faker.number.int({min:200, max:5000}) + ' issued. Customer notified.' : null,
      };

      // Add assigned_to only if column exists
      if (hasNewColumns) {
        complaintData.assigned_to = agent.id;
      }

      await supabase.from('complaints').insert(complaintData);
    }
    console.log(`  ✅ Seeded ${selected.length} complaints\n`);
  }

  // ── Seed Negotiations ──────────────────────────────────────────────────────
  if (productIds.length > 0 && buyers.length > 0 && sellers.length > 0) {
    console.log('💬 Seeding 30 negotiations...');
    for (let i = 0; i < 30; i++) {
      const buyer = faker.helpers.arrayElement(buyers);
      const product = faker.helpers.arrayElement(productIds);
      const seller = sellers.find(s => s.id === product.seller_id) || faker.helpers.arrayElement(sellers);
      const negPrice = Math.round(product.price * (0.65 + Math.random() * 0.25));
      await supabase.from('negotiations').insert({
        buyer_id: buyer.id,
        seller_id: seller.id,
        product_id: product.id,
        current_price: negPrice,
        status: faker.helpers.arrayElement(['open', 'open', 'countered', 'accepted', 'rejected']),
      });
    }
    console.log('  ✅ Seeded 30 negotiations\n');
  }

  // ── Seed Stock Requests ────────────────────────────────────────────────────
  if (productIds.length > 0 && sellers.length > 1) {
    console.log('📊 Seeding 10 stock requests...');
    for (let i = 0; i < 10; i++) {
      const reqSeller = sellers[i % sellers.length];
      const product = faker.helpers.arrayElement(productIds);
      const { data: sr, error } = await supabase.from('stock_requests').insert({
        requesting_seller_id: reqSeller.id,
        product_id: product.id,
        quantity: faker.number.int({ min: 10, max: 100 }),
        target_price: Math.round(product.price * 0.75),
        status: faker.helpers.arrayElement(['open', 'open', 'fulfilled']),
      }).select('id').single();

      if (!error && sr) {
        const otherSellers = sellers.filter(s => s.id !== reqSeller.id);
        const numBids = faker.number.int({ min: 1, max: 3 });
        for (let b = 0; b < numBids && b < otherSellers.length; b++) {
          await supabase.from('stock_bids').insert({
            request_id: sr.id,
            bidding_seller_id: otherSellers[b].id,
            bid_price: Math.round(product.price * (0.65 + Math.random() * 0.1)),
            status: faker.helpers.arrayElement(['pending', 'pending', 'accepted']),
          });
        }
      }
    }
    console.log('  ✅ Seeded 10 stock requests with bids\n');
  }

  console.log('🎉 ══════════════════════════════════════════════════');
  console.log('   Products + Orders seeded SUCCESSFULLY!');
  console.log('══════════════════════════════════════════════════');
  console.log(`   Products:  ${productIds.length}`);
  console.log(`   Orders:    ${totalOrders}`);
  console.log(`   Buyers:    ${buyers.length}`);
  console.log(`   Sellers:   ${sellers.length}`);
  console.log('══════════════════════════════════════════════════\n');
}

seedProductsAndOrders().catch(err => {
  console.error('💥 Fatal seeding error:', err);
  process.exit(1);
});
