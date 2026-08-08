const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const keywordImages = {
  // Electronics
  'mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
  'tv': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=600&fit=crop',
  'iphone': 'https://images.unsplash.com/photo-1603791440384-56cb16ea0c5e?w=600&h=600&fit=crop',
  'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
  'keyboard': 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop',
  'charger': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop',
  'speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
  'headset': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop',
  'headphone': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
  'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop',
  'earbud': 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop',
  'hard drive': 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&h=600&fit=crop',
  'router': 'https://images.unsplash.com/photo-1606115915130-450700dca876?w=600&h=600&fit=crop',
  'camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop',
  'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
  'smartwatch': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop',

  // Fashion
  'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
  'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop',
  'saree': 'https://images.unsplash.com/photo-1610189013098-99d9ed8005b6?w=600&h=600&fit=crop',
  'blazer': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop',
  'kurti': 'https://images.unsplash.com/photo-1583391733958-d150d87a41ec?w=600&h=600&fit=crop',
  'panjabi': 'https://images.unsplash.com/photo-1563261266-9dc779a5b3a4?w=600&h=600&fit=crop',
  'shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
  'sneaker': 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=600&h=600&fit=crop',

  // Home & Furniture
  'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
  'mattress': 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&h=600&fit=crop',
  'bed': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop',
  'cookware': 'https://images.unsplash.com/photo-1556910103-1c02745a872f?w=600&h=600&fit=crop',
  'chair': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=600&fit=crop',
  'table': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=600&fit=crop',
  'lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop',
  
  // Sports & Outdoors
  'bicycle': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=600&fit=crop',
  'tent': 'https://images.unsplash.com/photo-1504280390224-4f5145cdb2c9?w=600&h=600&fit=crop',
  'dumbbell': 'https://images.unsplash.com/photo-1586401700059-7170a41d6363?w=600&h=600&fit=crop',
  'yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
  
  // Food
  'rice': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&h=600&fit=crop',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop',
  'mango': 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=600&fit=crop',

  // Health
  'vitamin': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop',
  'medicine': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop',
};

const categoryFallbacks = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop',
  'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop',
  'Home': 'https://images.unsplash.com/photo-1484101403630-f273cad34f28?w=600&h=600&fit=crop',
  'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=600&fit=crop',
  'Food': 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=600&fit=crop',
  'Industrial': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&h=600&fit=crop',
  'Health': 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&h=600&fit=crop',
  'default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'
};

async function fixImages() {
  const { data: products, error } = await supabase.from('products').select('id, category, name');
  if (error || !products) return console.error('Failed to load products');
  
  console.log(`Fixing images for ${products.length} products...`);
  let count = 0;
  for (const product of products) {
    const nameLower = product.name.toLowerCase();
    let finalImage = null;
    
    // Check keywords
    for (const [key, url] of Object.entries(keywordImages)) {
      if (nameLower.includes(key)) {
        finalImage = url;
        break;
      }
    }
    
    // Fallback to category
    if (!finalImage) {
      finalImage = categoryFallbacks[product.category] || categoryFallbacks['default'];
    }
    
    await supabase.from('products').update({ images: JSON.stringify([finalImage]) }).eq('id', product.id);
    count++;
  }
  
  console.log(`✅ Fixed ${count} product images with better keyword matching.`);
}

fixImages();
