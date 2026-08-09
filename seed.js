import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Fetching existing products...');
  const { data: existing, error: err } = await supabase.from('products').select('id');
  if (err) {
    console.error('Error fetching products', err);
    return;
  }
  
  if (existing.length > 0) {
    console.log('Products already exist, skipping seed.');
    return;
  }

  console.log('Seeding products...');
  
  // Need a seller first
  const { data: seller } = await supabase.from('users').select('id').eq('role', 'seller').limit(1).single();
  const sellerId = seller ? seller.id : null;

  if (!sellerId) {
    console.log('No seller found. Make sure to login as seller at least once or create one.');
    return;
  }

  const MOCK_PRODUCTS = [
    { name: 'Industrial High-Purity Copper Wire (99.99%)', category: 'Industrial & Metals', price: 450, unit: 'kg', min_order_quantity: 500, seller_id: sellerId, stock_quantity: 10000, images: ['https://images.unsplash.com/photo-1574345371569-b5413bc7cb9f?w=600&h=600&fit=crop&q=80'], description: 'Electrolytic tough pitch copper wire for electrical wiring, motors, and high-performance manufacturing. Tested for high conductivity and durability.' },
    { name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics & Gadgets', price: 32000, unit: 'unit', min_order_quantity: 5, seller_id: sellerId, stock_quantity: 500, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80'], description: 'Industry-leading noise canceling headphones with dual processors and 8 microphones. Crystal clear hands-free calling and up to 30-hour battery life.' },
    { name: 'Structural Steel Beams (I-Beam Grade 50)', category: 'Industrial & Metals', price: 95000, unit: 'ton', min_order_quantity: 2, seller_id: sellerId, stock_quantity: 100, images: ['https://images.unsplash.com/photo-1518349542013-176b6a03cc09?w=600&h=600&fit=crop&q=80'], description: 'High-tensile structural steel I-beams for commercial building frames, bridges, and infrastructure projects.' },
    { name: 'Ergonomic Mesh Executive Chair', category: 'Home & Furniture', price: 14500, unit: 'unit', min_order_quantity: 5, seller_id: sellerId, stock_quantity: 200, images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop&q=80'], description: 'Premium breathable mesh office chair with 3D lumbar support, adjustable armrests, and 135-degree recline.' },
    { name: 'Monocrystalline Solar Panels (550W)', category: 'Electronics & Gadgets', price: 18500, unit: 'panel', min_order_quantity: 10, seller_id: sellerId, stock_quantity: 500, images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=600&fit=crop&q=80'], description: 'High-efficiency PERC monocrystalline solar panels. Designed for industrial solar rooftops and off-grid solar farms.' }
  ];

  const { error: insertErr } = await supabase.from('products').insert(MOCK_PRODUCTS);
  if (insertErr) {
    console.error('Error inserting products', insertErr);
  } else {
    console.log('Successfully seeded products!');
  }
}

seed();
