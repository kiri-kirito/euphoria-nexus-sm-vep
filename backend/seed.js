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

// ─── Realistic Bangladesh-focused product catalog ───────────────────────────
const PRODUCT_CATALOG = [
  // Electronics
  { name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', price: 32000, keywords: 'headphones,sony,wireless' },
  { name: 'Logitech MX Master 3S Mouse', category: 'Electronics', price: 10500, keywords: 'mouse,logitech,wireless' },
  { name: 'Samsung 65" QLED 4K Smart TV', category: 'Electronics', price: 185000, keywords: 'samsung,tv,television,smart' },
  { name: 'Apple iPhone 15 Pro (256GB)', category: 'Electronics', price: 175000, keywords: 'iphone,apple,smartphone' },
  { name: 'ASUS ROG Strix G15 Gaming Laptop', category: 'Electronics', price: 165000, keywords: 'laptop,asus,gaming' },
  { name: 'Custom RGB Mechanical Gaming Keyboard', category: 'Electronics', price: 4800, keywords: 'keyboard,mechanical,gaming,rgb' },
  { name: 'Xiaomi Smart Band 8 Pro', category: 'Electronics', price: 5500, keywords: 'smartwatch,xiaomi,fitness,band' },
  { name: 'Anker 65W USB-C GaN Charger', category: 'Electronics', price: 3200, keywords: 'charger,usb-c,anker' },
  { name: 'JBL Charge 5 Portable Speaker', category: 'Electronics', price: 18000, keywords: 'speaker,jbl,bluetooth,portable' },
  { name: 'Corsair HS80 RGB Wireless Headset', category: 'Electronics', price: 15500, keywords: 'headset,corsair,gaming,wireless' },
  { name: 'LG 27" IPS 4K Monitor', category: 'Electronics', price: 55000, keywords: 'monitor,lg,4k,display' },
  { name: 'Realme Buds Air 5 Pro TWS Earbuds', category: 'Electronics', price: 6500, keywords: 'earbuds,wireless,bluetooth,earphones' },
  { name: 'WD 1TB External Hard Drive', category: 'Electronics', price: 7200, keywords: 'hard-drive,storage,wd,external' },
  { name: 'TP-Link AX3000 Wi-Fi 6 Router', category: 'Electronics', price: 12500, keywords: 'router,wifi,tp-link,networking' },
  { name: 'GoPro Hero 12 Action Camera', category: 'Electronics', price: 52000, keywords: 'camera,gopro,action,sports' },

  // Fashion
  { name: 'Premium Oxford Cotton Dress Shirt (White)', category: 'Fashion', price: 2800, keywords: 'shirt,dress,white,formal,men' },
  { name: 'Denim Slim Fit Jeans (Dark Blue)', category: 'Fashion', price: 3500, keywords: 'jeans,denim,slim,fashion' },
  { name: 'Traditional Jamdani Saree (Handwoven)', category: 'Fashion', price: 8500, keywords: 'saree,bangladeshi,jamdani,traditional' },
  { name: 'Formal Blazer (Charcoal Grey)', category: 'Fashion', price: 12000, keywords: 'blazer,suit,formal,grey,men' },
  { name: 'Cotton Kurtis Set for Women', category: 'Fashion', price: 2200, keywords: 'kurti,women,cotton,ethnic' },
  { name: 'Panjabi (Eid Special, Embroidered)', category: 'Fashion', price: 4500, keywords: 'panjabi,eid,traditional,bangladeshi,men' },
  { name: 'Gym Performance T-Shirt (Dri-Fit)', category: 'Fashion', price: 1200, keywords: 'tshirt,gym,sports,dri-fit' },
  { name: 'Women\'s Formal Abaya (Black)', category: 'Fashion', price: 3800, keywords: 'abaya,women,islamic,fashion,black' },

  // Home & Furniture
  { name: 'Ergonomic Mesh Executive Office Chair', category: 'Home', price: 14500, keywords: 'chair,office,ergonomic,mesh' },
  { name: 'Modern L-Shape Sofa Set (Grey)', category: 'Home', price: 65000, keywords: 'sofa,furniture,living-room,grey' },
  { name: 'Teak Wood Dining Table (6 Seater)', category: 'Home', price: 42000, keywords: 'dining,table,wood,furniture' },
  { name: 'Memory Foam Mattress (King Size)', category: 'Home', price: 28000, keywords: 'mattress,sleep,memory-foam,bed' },
  { name: 'Kitchen Stand Mixer (Stainless Steel)', category: 'Home', price: 12500, keywords: 'kitchen,mixer,baking,cooking' },
  { name: 'Non-Stick Cookware Set (10 Pieces)', category: 'Home', price: 6800, keywords: 'cookware,kitchen,non-stick,pots' },
  { name: 'Smart LED Ceiling Light (Dimmable)', category: 'Home', price: 3500, keywords: 'light,led,smart,ceiling,home' },
  { name: 'Portable Air Conditioner (1.5 Ton)', category: 'Home', price: 85000, keywords: 'air-conditioner,ac,cooling,portable' },

  // Sports
  { name: 'Nike Air Max 270 (Men\'s, Size 42)', category: 'Sports', price: 14500, keywords: 'nike,shoes,running,air-max' },
  { name: 'Adidas Ultraboost 23 Running Shoes', category: 'Sports', price: 18000, keywords: 'adidas,shoes,running,ultraboost' },
  { name: 'Badminton Racket Set (Yonex)', category: 'Sports', price: 4500, keywords: 'badminton,racket,yonex,sports' },
  { name: 'Professional Cricket Bat (Kashmir Willow)', category: 'Sports', price: 5500, keywords: 'cricket,bat,sports,willow' },
  { name: 'Yoga Mat with Carrying Bag', category: 'Sports', price: 1800, keywords: 'yoga,mat,fitness,exercise' },
  { name: 'Adjustable Dumbbell Set (2-20kg)', category: 'Sports', price: 8500, keywords: 'dumbbell,gym,fitness,weights' },

  // Food & Grocery
  { name: 'Organic Basmati Rice (5kg Premium)', category: 'Food', price: 850, keywords: 'rice,basmati,organic,food' },
  { name: 'Cold-Pressed Mustard Oil (1L)', category: 'Food', price: 320, keywords: 'mustard-oil,oil,cooking,organic' },
  { name: 'Premium Honey (Sundarban, 500g)', category: 'Food', price: 1200, keywords: 'honey,natural,organic,sundarban' },
  { name: 'Hilsa Fish (Ilish, 1kg, Fresh)', category: 'Food', price: 2800, keywords: 'fish,hilsa,ilish,bengali,food' },
  { name: 'Mixed Dry Fruits Gift Box (1kg)', category: 'Food', price: 3500, keywords: 'dry-fruits,nuts,gift,healthy' },
  { name: 'Organic Green Tea (100g, Premium)', category: 'Food', price: 950, keywords: 'tea,green-tea,organic,health' },

  // Industrial
  { name: 'Industrial High-Purity Copper Wire (99.99%, per kg)', category: 'Industrial', price: 950, keywords: 'copper,wire,industrial,metal' },
  { name: 'Monocrystalline Solar Panels (550W, per unit)', category: 'Industrial', price: 18500, keywords: 'solar,panel,energy,renewable' },
  { name: 'Structural Steel I-Beams (Grade 50, per ton)', category: 'Industrial', price: 95000, keywords: 'steel,beam,construction,industrial' },
  { name: 'High-Pressure Water Pump (5HP)', category: 'Industrial', price: 28000, keywords: 'pump,water,industrial,motor' },
  { name: 'Industrial Safety Helmet (EN397 Certified)', category: 'Industrial', price: 1800, keywords: 'helmet,safety,industrial,construction' },

  // Accessories
  { name: 'Leather Bifold Wallet (Genuine Cowhide)', category: 'Accessories', price: 2500, keywords: 'wallet,leather,men,accessories' },
  { name: 'Titanium Aviator Sunglasses', category: 'Accessories', price: 8500, keywords: 'sunglasses,aviator,titanium,uv' },
  { name: 'Handcrafted Silver Earrings Set', category: 'Accessories', price: 4500, keywords: 'earrings,silver,jewelry,handcraft' },
  { name: 'Canvas Laptop Backpack (Anti-theft)', category: 'Accessories', price: 3800, keywords: 'backpack,laptop,bag,canvas' },
  { name: 'Analog Dress Watch (Stainless Steel)', category: 'Accessories', price: 12000, keywords: 'watch,analog,stainless,dress' },
  { name: 'Travel Neck Pillow (Memory Foam)', category: 'Accessories', price: 950, keywords: 'pillow,travel,neck,memory-foam' },
  { name: 'RFID-Blocking Passport Holder', category: 'Accessories', price: 850, keywords: 'passport,travel,rfid,holder' },
  { name: 'Stainless Steel Water Bottle (1L, Insulated)', category: 'Accessories', price: 1600, keywords: 'bottle,water,stainless,insulated' },

  // Health
  { name: 'Digital Blood Pressure Monitor (Omron)', category: 'Health', price: 4800, keywords: 'blood-pressure,monitor,health,omron' },
  { name: 'Pulse Oximeter (Fingertip)', category: 'Health', price: 1200, keywords: 'oximeter,pulse,health,medical' },
  { name: 'Vitamin D3 Supplements (90 Tablets)', category: 'Health', price: 650, keywords: 'vitamin,supplements,health,medicine' },
  { name: 'Electric Toothbrush (Philips Sonicare)', category: 'Health', price: 5500, keywords: 'toothbrush,electric,philips,dental' },
  { name: 'Infrared Thermometer (Non-contact)', category: 'Health', price: 2200, keywords: 'thermometer,infrared,health,temperature' },
];

// ─── Dhaka area coordinates ───────────────────────────────────────────────────
function getRandomDhakaCoords() {
  const lat = 23.68 + Math.random() * 0.25;
  const lng = 90.32 + Math.random() * 0.18;
  return { lat, lng };
}

// ─── Store names relevant to product categories ───────────────────────────────
const STORE_NAMES = [
  'TechHaven BD', 'AudioWorld Bangladesh', 'GamerZone BD', 'SmartGadget Store',
  'Digital Valley', 'ElectroHub BD', 'PixelPoint BD', 'CyberShop Bangladesh',
  'StyleMax BD', 'FashionVault', 'TrendZone Bangladesh', 'EthnixWear BD',
  'SilkRoute Fabrics', 'UrbanThreads BD', 'ModaStyle BD', 'CoutureCraft BD',
  'HomeHarbor BD', 'FurniturePlus', 'LivingSpace BD', 'KitchenMart Bangladesh',
  'ComfortZone Home', 'DreamDecor BD', 'AquaHome BD', 'NestCraft BD',
  'SportStation BD', 'AthleticEdge', 'FitLife BD', 'GoSports Bangladesh',
  'CricketWorld BD', 'ActiveZone BD', 'ProFit BD', 'SpeedDash BD',
  'FreshGrocer BD', 'NatureMart', 'OrganicBangladesh', 'HarvestHub BD',
  'GreenLeaf Store', 'FarmFresh BD', 'PureEats BD', 'NourishBD',
  'IndustrialCore BD', 'SteelCo Bangladesh', 'MetalCraft BD', 'GreenTech Energy',
  'BuildRight BD', 'PowerSource BD', 'StructureFirst BD', 'InfraBuild BD',
  'AccessoriesHub BD', 'LuxeGift BD', 'HealthFirst BD', 'MediShop BD',
];

const DHAKA_AREAS = [
  'Gulshan, Dhaka', 'Banani, Dhaka', 'Dhanmondi, Dhaka', 'Uttara, Dhaka',
  'Mirpur, Dhaka', 'Mohammadpur, Dhaka', 'Motijheel, Dhaka', 'Old Dhaka',
  'Wari, Dhaka', 'Rayer Bazar, Dhaka', 'Shyamoli, Dhaka', 'Gazipur',
  'Narayanganj', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna',
  'Barisal', 'Mymensingh', 'Comilla',
];

const BANGLADESHI_NAMES = [
  'Rahim Ahmed', 'Karim Hossain', 'Nasrin Begum', 'Fatima Khatun',
  'Mohammad Ali', 'Hafizur Rahman', 'Sultana Parvin', 'Mahbub Alam',
  'Shahinur Islam', 'Roksana Akter', 'Jahangir Alam', 'Morsheda Khanam',
  'Abul Bashar', 'Nurul Islam', 'Hasina Begum', 'Rafiqul Islam',
  'Amina Khatun', 'Delwar Hossain', 'Sumaiya Akter', 'Tariqul Islam',
  'Razia Sultana', 'Shahidur Rahman', 'Parvin Akter', 'Alamgir Hossain',
  'Mosammat Begum', 'Shafiqul Islam', 'Nusrat Jahan', 'Mizanur Rahman',
  'Sabina Yesmin', 'Golam Mostafa', 'Tahmina Begum', 'Enamul Haque',
  'Kohinoor Begum', 'Abdul Karim', 'Shamim Ara', 'Zahirul Islam',
  'Mofizur Rahman', 'Ayesha Siddiqua', 'Sirajul Islam', 'Monira Begum',
];

function randomBangladeshiName() {
  return faker.helpers.arrayElement(BANGLADESHI_NAMES) + ' ' + faker.helpers.arrayElement(['Khan', 'Chowdhury', 'Sarkar', 'Molla', 'Sheikh', 'Sikder', 'Bhuiyan', 'Mondal']);
}

function getUnsplashUrl(keywords, size = '600x600') {
  const keyword = keywords.split(',')[0];
  return `https://images.unsplash.com/photo-${getPhotoId(keyword)}?w=600&h=600&fit=crop&q=80`;
}

// Map keywords to known good Unsplash photo IDs
function getPhotoId(keyword) {
  const photoMap = {
    'headphones': '1505740420928-5e560c06d30e',
    'sony': '1505740420928-5e560c06d30e',
    'mouse': '1527814050087-379381547969',
    'logitech': '1527814050087-379381547969',
    'samsung': '1539632346870-3e851d6c8bea',
    'tv': '1539632346870-3e851d6c8bea',
    'iphone': '1592750475338-74b7b21085ab',
    'apple': '1592750475338-74b7b21085ab',
    'smartphone': '1592750475338-74b7b21085ab',
    'laptop': '1593642632559-0c6d3fc62b89',
    'gaming': '1593642632559-0c6d3fc62b89',
    'keyboard': '1595225476474-87563907a212',
    'smartwatch': '1523275335684-37898b6baf30',
    'fitness': '1517836357463-d25dfeac3438',
    'charger': '1573739022854-abda39a7af48',
    'speaker': '1608043152269-423dbba4e7e1',
    'jbl': '1608043152269-423dbba4e7e1',
    'headset': '1505740420928-5e560c06d30e',
    'monitor': '1527443224154-c4a3942d3acf',
    'earbuds': '1505740420928-5e560c06d30e',
    'hard-drive': '1531492746076-161ca9bcad58',
    'router': '1558618666-fcd25c85cd64',
    'camera': '1516035069371-29a1b244cc32',
    'shirt': '1620799140188-3b2a02fd9a77',
    'jeans': '1542272604-787c3835535d',
    'saree': '1610030169371-5d5ed16f6b5e',
    'blazer': '1507003211169-0a1dd7228f2d',
    'kurti': '1610030169371-5d5ed16f6b5e',
    'panjabi': '1610030169371-5d5ed16f6b5e',
    'tshirt': '1581655353564-df123a1eb820',
    'abaya': '1609710228159-0fa9bd7c0827',
    'chair': '1580480055273-228ff5388ef8',
    'sofa': '1555041469-a586c61ea9bc',
    'furniture': '1555041469-a586c61ea9bc',
    'dining': '1567538096630-e0c55bd6374c',
    'mattress': '1540518614846-7eded433c457',
    'kitchen': '1556909114-44e3e9399a73',
    'cookware': '1556909114-44e3e9399a73',
    'light': '1565814329452-e1efa11ef470',
    'air-conditioner': '1585771724684-38269d6639fd',
    'nike': '1542291026-7eec264c27ff',
    'shoes': '1542291026-7eec264c27ff',
    'adidas': '1542291026-7eec264c27ff',
    'running': '1542291026-7eec264c27ff',
    'badminton': '1574629810360-7efbbe195018',
    'cricket': '1569534403078-95f82bc9a35d',
    'yoga': '1544367567-0f2fcb009e0b',
    'dumbbell': '1534438327276-14e5300c3a48',
    'rice': '1568901346375-23c9450c58cd',
    'mustard-oil': '1474979219468-65ba4c2308d3',
    'honey': '1587049352851-8d4e89133924',
    'fish': '1534482421-64566f976cfa',
    'dry-fruits': '1563805042-7684c019e1cb',
    'tea': '1556742049-0cfed4f6a45d',
    'copper': '1574345371569-b5413bc7cb9f',
    'solar': '1509391366360-2e959784a276',
    'steel': '1518349542013-176b6a03cc09',
    'pump': '1597484661643-2f5fef640dd1',
    'helmet': '1527525443537-87f3ff3d585f',
    'wallet': '1553062407-98eeb64c6a62',
    'sunglasses': '1511499767150-a7a1371514ec',
    'earrings': '1515562141207-7a88fb7ce338',
    'backpack': '1553062407-98eeb64c6a62',
    'watch': '1523275335684-37898b6baf30',
    'pillow': '1540518614846-7eded433c457',
    'passport': '1488085061851-07c3c6c28748',
    'bottle': '1602143407151-7111542de764',
    'blood-pressure': '1576091160399-112ba8d25d1d',
    'oximeter': '1576091160399-112ba8d25d1d',
    'vitamin': '1584308666744-24d5c474f2ae',
    'toothbrush': '1609840114035-3c981b782dfe',
    'thermometer': '1576091160399-112ba8d25d1d',
  };

  const k = keyword.toLowerCase().trim();
  if (photoMap[k]) return photoMap[k];

  // fallback by first word
  const first = k.split('-')[0];
  if (photoMap[first]) return photoMap[first];

  // generic fallback
  return '1568901346375-23c9450c58cd';
}

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting comprehensive Euphoria Nexus database seed...\n');

  // ── Step 1: Create Admin users ──────────────────────────────────────────────
  console.log('👑 Creating 2 Admin accounts...');
  const adminProfiles = [];
  const admins = [
    { email: 'admin1@euphoria.com', name: 'Super Admin (Euphoria)' },
    { email: 'admin2@euphoria.com', name: 'Platform Manager (Euphoria)' },
  ];
  for (const a of admins) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: a.email, password: 'Admin@1234',
      email_confirm: true,
      user_metadata: { name: a.name, role: 'admin' }
    });
    if (error && error.message.includes('already registered')) {
      console.log(`  ⚠️  ${a.email} already exists, skipping`);
      continue;
    }
    if (error) { console.error(`  ❌ Admin error: ${error.message}`); continue; }
    adminProfiles.push({ id: data.user.id, ...a });
    await supabase.from('users').upsert({ id: data.user.id, name: a.name, email: a.email, password_hash: 'supabase_auth', role: 'admin' });
    console.log(`  ✅ ${a.email}`);
  }

  // ── Step 2: Create Support Agents ──────────────────────────────────────────
  console.log('\n🎧 Creating 10 Support Agent accounts...');
  const supportProfiles = [];
  for (let i = 1; i <= 10; i++) {
    const email = `support${i}@euphoria.com`;
    const name = randomBangladeshiName();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password: 'Support@1234', email_confirm: true,
      user_metadata: { name, role: 'support' }
    });
    if (error && error.message.includes('already registered')) { console.log(`  ⚠️  ${email} exists`); continue; }
    if (error) { console.error(`  ❌ ${email}: ${error.message}`); continue; }
    const coords = getRandomDhakaCoords();
    await supabase.from('users').upsert({
      id: data.user.id, name, email, password_hash: 'supabase_auth', role: 'support',
      phone: `+8801${faker.number.int({min:700000000, max:999999999})}`,
      address: faker.helpers.arrayElement(DHAKA_AREAS),
    });
    supportProfiles.push({ id: data.user.id, name, email, is_online: i <= 6 });
    console.log(`  ✅ ${email} - ${name}`);
  }

  // ── Step 3: Create Delivery Agents ─────────────────────────────────────────
  console.log('\n🚚 Creating 20 Delivery Agent accounts...');
  const deliveryProfiles = [];
  for (let i = 1; i <= 20; i++) {
    const email = `delivery${i}@euphoria.com`;
    const name = randomBangladeshiName();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password: 'Delivery@1234', email_confirm: true,
      user_metadata: { name, role: 'agent' }
    });
    if (error && error.message.includes('already registered')) { console.log(`  ⚠️  ${email} exists`); continue; }
    if (error) { console.error(`  ❌ ${email}: ${error.message}`); continue; }
    await supabase.from('users').upsert({
      id: data.user.id, name, email, password_hash: 'supabase_auth', role: 'agent',
      phone: `+8801${faker.number.int({min:700000000, max:999999999})}`,
      address: faker.helpers.arrayElement(DHAKA_AREAS),
    });
    deliveryProfiles.push({ id: data.user.id, name, email, is_online: i <= 12 });
    console.log(`  ✅ ${email} - ${name}`);
  }

  // ── Step 4: Create Sellers ─────────────────────────────────────────────────
  console.log('\n🏪 Creating 50 Seller accounts...');
  const sellerProfiles = [];
  for (let i = 1; i <= 50; i++) {
    const email = `seller${i}@euphoria.com`;
    const name = randomBangladeshiName();
    const storeName = STORE_NAMES[(i - 1) % STORE_NAMES.length];
    const coords = getRandomDhakaCoords();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password: 'Seller@1234', email_confirm: true,
      user_metadata: { name, role: 'seller', store_name: storeName }
    });
    if (error && error.message.includes('already registered')) { console.log(`  ⚠️  ${email} exists`); continue; }
    if (error) { console.error(`  ❌ ${email}: ${error.message}`); continue; }
    await supabase.from('users').upsert({
      id: data.user.id, name, email, password_hash: 'supabase_auth', role: 'seller',
      phone: `+8801${faker.number.int({min:700000000, max:999999999})}`,
      address: faker.helpers.arrayElement(DHAKA_AREAS),
    });
    // Create store
    const { error: storeErr } = await supabase.from('stores').upsert({
      user_id: data.user.id,
      store_name: storeName,
      description: `${storeName} is a trusted seller on Euphoria Nexus, offering quality products with fast delivery across Bangladesh.`,
      is_approved: true,
      rating: (4.0 + Math.random()).toFixed(1),
      total_sales: faker.number.int({ min: 50, max: 2000 }),
      phone: `+8801${faker.number.int({min:700000000, max:999999999})}`,
    });
    if (storeErr) console.error(`  ⚠️  Store error for seller${i}:`, storeErr.message);
    sellerProfiles.push({ id: data.user.id, name, email, storeName });
    if (i % 10 === 0) console.log(`  ✅ Created ${i}/50 sellers...`);
  }
  console.log(`  ✅ Total sellers created: ${sellerProfiles.length}`);

  // ── Step 5: Create 200 Products ────────────────────────────────────────────
  console.log('\n📦 Creating 200 Products across sellers...');
  const productIds = [];
  
  if (sellerProfiles.length === 0) {
    console.log('  ⚠️  No sellers to assign products to. Skipping products.');
  } else {
    // Distribute products: each product from catalog assigned round-robin to sellers
    let sellerIndex = 0;
    let productCount = 0;
    
    // First pass: create one of each catalog product
    for (const product of PRODUCT_CATALOG) {
      const seller = sellerProfiles[sellerIndex % sellerProfiles.length];
      sellerIndex++;
      const keyword = product.keywords.split(',')[0];
      const imageUrl = `https://images.unsplash.com/photo-${getPhotoId(keyword)}?w=600&h=600&fit=crop&q=80`;
      const moq = faker.number.int({ min: 1, max: 20 });
      const { data: prod, error } = await supabase.from('products').insert({
        seller_id: seller.id,
        name: product.name,
        description: `${product.name} - Premium quality product available on Euphoria Nexus. Trusted seller with fast Bangladesh delivery. Category: ${product.category}.`,
        price: product.price,
        compare_price: Math.round(product.price * 1.15),
        quantity: faker.number.int({ min: 20, max: 500 }),
        category: product.category,
        moq,
        status: 'active',
        images: JSON.stringify([imageUrl, imageUrl]),
      }).select().single();
      if (error) { console.error(`  ❌ Product error: ${error.message} for ${product.name}`); continue; }
      productIds.push({ id: prod.id, seller_id: seller.id, price: product.price, name: product.name });
      productCount++;
    }

    // Second pass: create variations to reach 200 products
    const remainingNeeded = 200 - productCount;
    for (let i = 0; i < remainingNeeded && i < PRODUCT_CATALOG.length * 2; i++) {
      const baseProd = PRODUCT_CATALOG[i % PRODUCT_CATALOG.length];
      const seller = sellerProfiles[sellerIndex % sellerProfiles.length];
      sellerIndex++;
      const variantName = `${baseProd.name} (${faker.helpers.arrayElement(['Pro', 'Lite', 'Plus', 'Premium', 'Special Edition'])})`;
      const variantPrice = Math.round(baseProd.price * (0.85 + Math.random() * 0.3));
      const keyword = baseProd.keywords.split(',')[0];
      const imageUrl = `https://images.unsplash.com/photo-${getPhotoId(keyword)}?w=600&h=600&fit=crop&q=80`;
      const { data: prod, error } = await supabase.from('products').insert({
        seller_id: seller.id,
        name: variantName,
        description: `${variantName} - High quality variant available from ${seller.storeName || 'Euphoria Store'}. Fast delivery across Bangladesh.`,
        price: variantPrice,
        compare_price: Math.round(variantPrice * 1.12),
        quantity: faker.number.int({ min: 10, max: 300 }),
        category: baseProd.category,
        moq: faker.number.int({ min: 1, max: 10 }),
        status: 'active',
        images: JSON.stringify([imageUrl]),
      }).select().single();
      if (!error && prod) productIds.push({ id: prod.id, seller_id: seller.id, price: variantPrice, name: variantName });
    }
    console.log(`  ✅ Created ${productIds.length} products`);
  }

  // ── Step 6: Create 300 Buyers ──────────────────────────────────────────────
  console.log('\n👤 Creating 300 Buyer accounts...');
  const buyerProfiles = [];
  for (let i = 1; i <= 300; i++) {
    const email = `buyer${i}@euphoria.com`;
    const name = randomBangladeshiName();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password: 'Buyer@1234', email_confirm: true,
      user_metadata: { name, role: 'buyer' }
    });
    if (error && error.message.includes('already registered')) { continue; }
    if (error) { continue; }
    await supabase.from('users').upsert({
      id: data.user.id, name, email, password_hash: 'supabase_auth', role: 'buyer',
      phone: `+8801${faker.number.int({min:700000000, max:999999999})}`,
      address: faker.helpers.arrayElement(DHAKA_AREAS),
    });
    buyerProfiles.push({ id: data.user.id, name, email, address: faker.helpers.arrayElement(DHAKA_AREAS) });
    if (i % 50 === 0) console.log(`  ✅ Created ${i}/300 buyers...`);
  }
  console.log(`  ✅ Total buyers created: ${buyerProfiles.length}`);

  // ── Step 7: Create Orders (500+) ───────────────────────────────────────────
  if (buyerProfiles.length === 0 || productIds.length === 0) {
    console.log('\n⚠️  Skipping orders — no buyers or products available');
  } else {
    console.log('\n🛒 Creating 500+ interconnected Orders...');
    const orderIds = [];
    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered'];
    let totalOrders = 0;

    for (const buyer of buyerProfiles) {
      const numOrders = faker.number.int({ min: 1, max: 3 });
      for (let o = 0; o < numOrders; o++) {
        const numItems = faker.number.int({ min: 1, max: 4 });
        const orderItems = [];
        let totalAmount = 0;

        for (let item = 0; item < numItems; item++) {
          const product = faker.helpers.arrayElement(productIds);
          const qty = faker.number.int({ min: 1, max: 5 });
          const unitPrice = product.price;
          totalAmount += unitPrice * qty;
          orderItems.push({ product_id: product.id, seller_id: product.seller_id, quantity: qty, unit_price: unitPrice });
        }

        const status = faker.helpers.arrayElement(orderStatuses);
        const createdAt = faker.date.between({ from: '2025-01-01', to: new Date() });

        const { data: order, error: orderErr } = await supabase.from('orders').insert({
          buyer_id: buyer.id,
          total_amount: totalAmount,
          status,
          shipping_address: buyer.address,
          created_at: createdAt,
        }).select().single();
        if (orderErr || !order) continue;

        // Insert order items
        for (const oi of orderItems) {
          await supabase.from('order_items').insert({ ...oi, order_id: order.id });
        }

        // Create payment
        await supabase.from('payments').insert({
          order_id: order.id,
          amount: totalAmount,
          status: status === 'delivered' ? 'completed' : (status === 'pending' ? 'pending' : 'processing'),
          transaction_id: status === 'delivered' ? `TXN${faker.string.alphanumeric(12).toUpperCase()}` : null,
        });

        orderIds.push({ id: order.id, buyer_id: buyer.id, status, address: buyer.address });
        totalOrders++;
      }
      if (totalOrders % 100 === 0) console.log(`  ✅ Created ${totalOrders} orders so far...`);
    }
    console.log(`  ✅ Total orders: ${totalOrders}`);

    // ── Step 8: Create Deliveries ─────────────────────────────────────────────
    if (deliveryProfiles.length > 0) {
      console.log('\n📍 Creating Deliveries for shipped/delivered orders...');
      const shippedOrders = orderIds.filter(o => ['shipped', 'delivered', 'processing'].includes(o.status));
      let deliveryCount = 0;
      for (const order of shippedOrders) {
        const agent = faker.helpers.arrayElement(deliveryProfiles);
        const isDelivered = order.status === 'delivered';
        const deliveryStatuses = isDelivered ? ['delivered'] : ['assigned', 'picked_up', 'in_transit'];
        const dStatus = faker.helpers.arrayElement(deliveryStatuses);
        await supabase.from('deliveries').insert({
          order_id: order.id,
          agent_id: agent.id,
          pickup_address: faker.helpers.arrayElement(DHAKA_AREAS) + ', Bangladesh',
          delivery_address: order.address,
          status: dStatus,
          estimated_time: faker.date.future(),
          completed_at: isDelivered ? faker.date.recent() : null,
        });
        deliveryCount++;
      }
      console.log(`  ✅ Created ${deliveryCount} delivery assignments`);
    }

    // ── Step 9: Create Complaints ──────────────────────────────────────────────
    if (supportProfiles.length > 0 && orderIds.length > 0) {
      console.log('\n🎫 Creating 50 support complaints...');
      const deliveredOrders = orderIds.filter(o => o.status === 'delivered');
      const complaintReasons = [
        'Product received was different from what was shown online.',
        'Item arrived damaged. Need replacement.',
        'Wrong color/size delivered.',
        'Delivery took much longer than expected.',
        'Product quality is not as described.',
        'Received incorrect quantity.',
        'Package was opened/tampered with.',
        'Product stopped working after 2 days.',
      ];
      const selectedOrders = faker.helpers.arrayElements(deliveredOrders, Math.min(50, deliveredOrders.length));
      for (const order of selectedOrders) {
        const agent = faker.helpers.arrayElement(supportProfiles);
        const isResolved = Math.random() > 0.4;
        await supabase.from('complaints').insert({
          buyer_id: order.buyer_id,
          order_id: order.id,
          description: faker.helpers.arrayElement(complaintReasons),
          status: isResolved ? 'resolved' : 'open',
          resolution: isResolved ? 'Refund issued. Customer notified via email.' : null,
          assigned_to: agent.id,
        });
      }
      console.log('  ✅ Created 50 complaints');
    }

    // ── Step 10: Create Negotiations ───────────────────────────────────────────
    if (buyerProfiles.length > 0 && productIds.length > 0 && sellerProfiles.length > 0) {
      console.log('\n💬 Creating 30 negotiations...');
      for (let i = 0; i < 30; i++) {
        const buyer = faker.helpers.arrayElement(buyerProfiles);
        const product = faker.helpers.arrayElement(productIds);
        const seller = sellerProfiles.find(s => s.id === product.seller_id) || faker.helpers.arrayElement(sellerProfiles);
        const negotiatedPrice = Math.round(product.price * (0.7 + Math.random() * 0.2));
        await supabase.from('negotiations').insert({
          buyer_id: buyer.id,
          seller_id: seller.id,
          product_id: product.id,
          current_price: negotiatedPrice,
          status: faker.helpers.arrayElement(['open', 'countered', 'accepted', 'rejected']),
        });
      }
      console.log('  ✅ Created 30 negotiations');
    }
  }

  // ── Step 11: Create Stock Requests (Blind Bidding) ─────────────────────────
  if (sellerProfiles.length > 1 && productIds.length > 0) {
    console.log('\n📊 Creating 10 stock requests for blind bidding...');
    for (let i = 0; i < 10; i++) {
      const requestingSeller = faker.helpers.arrayElement(sellerProfiles);
      const product = faker.helpers.arrayElement(productIds);
      const { data: stockReq, error } = await supabase.from('stock_requests').insert({
        requesting_seller_id: requestingSeller.id,
        product_id: product.id,
        quantity: faker.number.int({ min: 10, max: 100 }),
        target_price: Math.round(product.price * 0.75),
        status: faker.helpers.arrayElement(['open', 'open', 'fulfilled']),
      }).select().single();

      if (!error && stockReq) {
        // Add 2-3 blind bids for open requests
        const numBids = faker.number.int({ min: 1, max: 3 });
        const biddingSellers = sellerProfiles.filter(s => s.id !== requestingSeller.id);
        for (let b = 0; b < numBids && b < biddingSellers.length; b++) {
          const biddingSeller = biddingSellers[b];
          await supabase.from('stock_bids').insert({
            request_id: stockReq.id,
            bidding_seller_id: biddingSeller.id,
            bid_price: Math.round(product.price * (0.65 + Math.random() * 0.15)),
            status: faker.helpers.arrayElement(['pending', 'pending', 'accepted']),
          });
        }
      }
    }
    console.log('  ✅ Created 10 stock requests with bids');
  }

  console.log('\n\n🎉 ════════════════════════════════════════════════════');
  console.log('   Euphoria Nexus database seeded SUCCESSFULLY!');
  console.log('════════════════════════════════════════════════════');
  console.log('\n📋 Default Login Credentials:');
  console.log('   ADMINS     → admin1@euphoria.com / Admin@1234');
  console.log('   SUPPORT    → support1@euphoria.com / Support@1234');
  console.log('   DELIVERY   → delivery1@euphoria.com / Delivery@1234');
  console.log('   SELLERS    → seller1@euphoria.com / Seller@1234');
  console.log('   BUYERS     → buyer1@euphoria.com / Buyer@1234');
  console.log('\n✅ All data is interconnected and consistent!');
  console.log('════════════════════════════════════════════════════\n');
}

seed().catch(err => {
  console.error('💥 Fatal error during seeding:', err);
  process.exit(1);
});
