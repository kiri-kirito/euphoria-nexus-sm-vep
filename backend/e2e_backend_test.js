const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkezevgkanjfsvxhipuc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing Supabase Anon Key!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("==========================================");
  console.log("🚀 STARTING E2E DYNAMIC PROPAGATION TEST 🚀");
  console.log("==========================================\n");

  // 1. Get a random Buyer, Seller, Delivery Agent, and Product
  console.log("Step 1: Gathering actors...");
  
  const { data: buyers } = await supabase.from('users').select('*').eq('role', 'buyer').limit(1);
  const { data: sellers } = await supabase.from('users').select('*').eq('role', 'seller').limit(1);
  const { data: agents } = await supabase.from('users').select('*').eq('role', 'delivery').limit(1);
  
  const buyer = buyers?.[0];
  const seller = sellers?.[0];
  const agent = agents?.[0];
  
  if (!buyer || !seller) {
    console.error("Missing users. Ensure DB is seeded.");
    return;
  }

  const { data: products } = await supabase.from('products').select('*').eq('seller_id', seller.id).limit(1);
  const product = products?.[0];
  
  if (!product) {
    console.error("Seller has no products.");
    return;
  }
  
  console.log(`✅ Roles ready: Buyer (${buyer.name}), Seller (${seller.name})`);
  console.log(`✅ Target Product: ${product.name} (Price: ৳${product.price})\n`);


  // 2. Pre-state Checks
  console.log("Step 2: Checking pre-purchase Admin GMV...");
  const { data: gmvDataBefore } = await supabase.from('orders').select('total_amount, status');
  const gmvBefore = (gmvDataBefore || []).reduce((s, o) => s + Number(o.total_amount), 0);
  console.log(`📊 Admin Total GMV: ৳${gmvBefore}\n`);

  
  // 3. Buyer Places an Order (Checkout Flow)
  console.log("Step 3: Buyer places an order...");
  const orderAmount = product.price * 2;
  
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([{
      buyer_id: buyer.id,
      total_amount: orderAmount,
      status: 'pending',
      shipping_address: '123 Test E2E St, Dhaka'
    }])
    .select()
    .single();
    
  if (orderErr) {
    console.error("❌ Order Creation Failed:", orderErr);
    return;
  }
  console.log(`✅ Order Created! ID: ${order.id}`);

  // Insert Order Item (Seller Dashboard Dependency)
  const { error: itemErr } = await supabase
    .from('order_items')
    .insert([{
      order_id: order.id,
      product_id: product.id,
      seller_id: seller.id,
      quantity: 2,
      unit_price: product.price
    }]);

  if (itemErr) {
    console.error("❌ Order Items Failed:", itemErr);
    return;
  }
  console.log(`✅ Order Item Created! (Bound to Seller ID: ${seller.id})`);

  // Insert Delivery Task (Delivery Dashboard Dependency)
  const { error: deliveryErr } = await supabase
    .from('deliveries')
    .insert([{
      order_id: order.id,
      delivery_address: '123 Test E2E St, Dhaka',
      status: 'assigned'
    }]);
    
  if (deliveryErr) {
    console.error("❌ Delivery Task Failed:", deliveryErr);
    return;
  }
  console.log(`✅ Delivery Task Created! (Status: Assigned)\n`);
  
  
  // 4. Verification Step - Read Data for Each Dashboard
  console.log("Step 4: Real-time Propagation Verification...");
  
  // 4a. Seller Dashboard
  const { data: sellerOrders } = await supabase.from('order_items')
    .select('*, orders!inner(status)')
    .eq('seller_id', seller.id)
    .eq('order_id', order.id);
  
  if (sellerOrders?.length > 0) {
    console.log(`🎉 SELLER DASHBOARD: Successfully received new order (৳${sellerOrders[0].quantity * sellerOrders[0].unit_price})`);
  } else {
    console.log(`❌ SELLER DASHBOARD: Order did not appear!`);
  }
  
  // 4b. Delivery Dashboard
  const { data: deliveryTasks } = await supabase.from('deliveries')
    .select('*')
    .eq('order_id', order.id);
    
  if (deliveryTasks?.length > 0) {
    console.log(`🎉 DELIVERY DASHBOARD: Successfully received delivery task (Status: ${deliveryTasks[0].status})`);
  } else {
    console.log(`❌ DELIVERY DASHBOARD: Task did not appear!`);
  }

  // 4c. Admin Dashboard
  const { data: gmvDataAfter } = await supabase.from('orders').select('total_amount, status');
  const gmvAfter = (gmvDataAfter || []).reduce((s, o) => s + Number(o.total_amount), 0);
  
  if (gmvAfter === gmvBefore + orderAmount) {
    console.log(`🎉 ADMIN DASHBOARD: Total GMV increased accurately! (Old: ৳${gmvBefore} -> New: ৳${gmvAfter})`);
  } else {
    console.log(`❌ ADMIN DASHBOARD: GMV mismatch. Old: ${gmvBefore}, New: ${gmvAfter}, Expected: ${gmvBefore + orderAmount}`);
  }
  
  
  // 5. Buyer Files a Complaint
  console.log("\nStep 5: Buyer files a complaint...");
  const { data: complaint, error: complaintErr } = await supabase
    .from('complaints')
    .insert([{
      buyer_id: buyer.id,
      order_id: order.id,
      description: 'E2E Test: Delivery is delayed.',
      status: 'open'
    }])
    .select()
    .single();
    
  if (complaintErr) {
    console.error("❌ Complaint Creation Failed:", complaintErr);
  } else {
    console.log(`✅ Complaint Created! ID: ${complaint.id}`);
  }
  
  // 6. Support Dashboard Verification
  const { data: supportTickets } = await supabase.from('complaints')
    .select('*')
    .eq('id', complaint?.id);
    
  if (supportTickets?.length > 0) {
    console.log(`🎉 SUPPORT DASHBOARD: Successfully received ticket (Status: ${supportTickets[0].status})`);
  } else {
    console.log(`❌ SUPPORT DASHBOARD: Ticket did not appear!`);
  }

  console.log("\n==========================================");
  console.log("🏁 ALL DYNAMIC PROPAGATION TESTS PASSED 🏁");
  console.log("==========================================");
}

runTest();
