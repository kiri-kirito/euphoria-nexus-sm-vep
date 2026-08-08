const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const imageMap = {
  'Electronics': [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop&q=80',
  ],
  'Industrial': [
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=600&fit=crop&q=80',
  ],
  'Agriculture': [
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535090467336-9501f96eef89?w=600&h=600&fit=crop&q=80',
  ],
  'Apparel': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434389678369-e84015f3e9b1?w=600&h=600&fit=crop&q=80',
  ],
  'Food': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543353071-087092ec393a?w=600&h=600&fit=crop&q=80',
  ],
  'Accessories': [
    'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512201078372-9c6b2a0d528a?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&h=600&fit=crop&q=80',
  ],
  'Health': [
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550572017-ed7b2d56a7eb?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511174511562-5f7f18e87418?w=600&h=600&fit=crop&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80', // Headphones
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80', // Smart watch
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop&q=80', // Camera
  ]
};

async function fixImages() {
  const { data: products, error } = await supabase.from('products').select('id, category, name');
  if (error || !products) {
    console.error('Failed to load products');
    return;
  }
  
  console.log(`Fixing images for ${products.length} products...`);
  let count = 0;
  for (const product of products) {
    const imagesForCat = imageMap[product.category] || imageMap['default'];
    // Pick a random image based on the ID or just a random one from the 3
    const randomImage = imagesForCat[Math.floor(Math.random() * imagesForCat.length)];
    
    // Some products have specific names where we can do better
    let finalImage = randomImage;
    const n = product.name.toLowerCase();
    if (n.includes('watch')) finalImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80';
    if (n.includes('keyboard')) finalImage = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop&q=80';
    if (n.includes('mouse')) finalImage = 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop&q=80';
    if (n.includes('phone') || n.includes('iphone')) finalImage = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&q=80';
    if (n.includes('tv') || n.includes('television')) finalImage = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop&q=80';
    if (n.includes('headphone') || n.includes('headset')) finalImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80';
    if (n.includes('laptop')) finalImage = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&q=80';
    
    await supabase.from('products').update({ images: JSON.stringify([finalImage]) }).eq('id', product.id);
    count++;
  }
  
  console.log(`✅ Fixed ${count} product images.`);
}

fixImages();
