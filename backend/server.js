const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { getSupabaseAdmin } = require('./lib/supabase');
const { attachNamespaceAuth } = require('./lib/socketAuth');

const app = express();
const server = http.createServer(app);

// Production CORS — FRONTEND_URL can be comma-separated; *.vercel.app allowed
function parseOrigins() {
  const fromEnv = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...fromEnv, 'http://localhost:3000'])];
}

const allowedOrigins = parseOrigins();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith('.vercel.app')) return true;
  } catch {
    /* ignore */
  }
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn('[CORS] Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) cb(null, true);
      else cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Euphoria Nexus Backend is running',
    env: process.env.NODE_ENV || 'development',
  });
});

// ---- Socket.io Handlers ----

// Root namespace
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

// /negotiations namespace — Bulk deal negotiations between Buyers and Sellers
const negotiationsNamespace = io.of('/negotiations');
attachNamespaceAuth(negotiationsNamespace, '/negotiations');
negotiationsNamespace.on('connection', (socket) => {
  console.log(`[Negotiations] Connected: ${socket.id}`);

  // New Negotiation Request from Buyer
  socket.on('new_negotiation', (data) => {
    console.log(`[Negotiations] new_negotiation:`, data);
    // Broadcast to the seller or to all in a generic room for now
    // A production app would send to the specific seller's room
    negotiationsNamespace.emit('receive_bulk_request', {
      id: Date.now(),
      buyer: data.buyerId || 'Guest Buyer',
      location: 'Unknown Location',
      product: data.productName,
      image: 'https://images.unsplash.com/photo-1527814050087-379381547969?q=80&w=200&auto=format&fit=crop',
      originalPrice: 0,
      offeredPrice: Number(data.targetPrice) || 0,
      discount: 'Custom',
      qty: Number(data.quantity) || 1,
      message: data.message,
      status: 'Pending'
    });
  });

  // Buyer proposes a price
  socket.on('propose_price', (data) => {
    console.log(`[Negotiations] propose_price:`, data);
    // Broadcast to all in the room (seller gets this)
    socket.to(data.roomId).emit('price_proposed', data);
  });

  // Seller counters
  socket.on('counter_offer', (data) => {
    console.log(`[Negotiations] counter_offer:`, data);
    socket.to(data.roomId).emit('offer_countered', data);
  });

  // Both parties accept
  socket.on('accept_deal', (data) => {
    console.log(`[Negotiations] accept_deal:`, data);
    negotiationsNamespace.to(data.roomId).emit('deal_accepted', {
      ...data,
      checkoutLink: `/checkout?deal=${data.dealId}`,
    });
  });

  // Join negotiation room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`[Negotiations] ${socket.id} joined room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Negotiations] Disconnected: ${socket.id}`);
  });
});

// /bidding namespace — Inter-Seller Blind Bidding (Stock Exchange)
const biddingNamespace = io.of('/bidding');
attachNamespaceAuth(biddingNamespace, '/bidding');
biddingNamespace.on('connection', (socket) => {
  console.log(`[Bidding] Connected: ${socket.id}`);

  // Seller posts a stock request
  socket.on('post_request', async (data) => {
    console.log(`[Bidding] post_request:`, data);
    const supabase = getSupabaseAdmin();
    let payload = { ...data };

    if (supabase && data.requestingSellerId && data.productId) {
      const { data: row, error } = await supabase
        .from('stock_requests')
        .insert({
          requesting_seller_id: data.requestingSellerId,
          product_id: data.productId,
          quantity: Number(data.quantity) || 1,
          target_price: Number(data.targetPrice) || 0,
          status: 'open',
        })
        .select('id')
        .single();

      if (!error && row) {
        payload = { ...data, id: row.id };
      } else if (error) {
        console.warn('[Bidding] post_request DB failed:', error.message);
      }
    }

    socket.broadcast.emit('new_stock_request', payload);
  });

  // Another seller submits an anonymous blind bid
  socket.on('submit_bid', async (data) => {
    console.log(`[Bidding] submit_bid:`, data);
    let bidId = `bid_${Date.now()}`;
    const supabase = getSupabaseAdmin();

    if (supabase && data.requestId && data.biddingSellerId && data.amount) {
      const { data: existing } = await supabase
        .from('stock_bids')
        .select('id')
        .eq('request_id', data.requestId)
        .eq('bidding_seller_id', data.biddingSellerId)
        .maybeSingle();

      if (existing) {
        socket.emit('bid_error', { message: 'You already submitted a bid for this request.' });
        return;
      }

      const { data: row, error } = await supabase
        .from('stock_bids')
        .insert({
          request_id: data.requestId,
          bidding_seller_id: data.biddingSellerId,
          bid_price: Number(data.amount),
          status: 'pending',
        })
        .select('id')
        .single();

      if (!error && row) {
        bidId = row.id;
      } else if (error) {
        console.warn('[Bidding] submit_bid DB failed:', error.message);
      }
    }

    socket.to(data.requesterId).emit('bid_received', {
      bidId,
      requestId: data.requestId,
      amount: data.amount,
      quantity: data.quantity,
    });
  });

  // Requesting seller accepts a bid — triggers escrow
  socket.on('accept_bid', async (data) => {
    console.log(`[Bidding] accept_bid:`, data);
    const supabase = getSupabaseAdmin();
    let escrowState = 'PENDING_TRANSFER';

    if (supabase && data.bidId && data.requestId) {
      const [{ data: bid }, { data: request }] = await Promise.all([
        supabase
          .from('stock_bids')
          .select('bid_price, bidding_seller_id')
          .eq('id', data.bidId)
          .maybeSingle(),
        supabase
          .from('stock_requests')
          .select('requesting_seller_id')
          .eq('id', data.requestId)
          .maybeSingle(),
      ]);

      await supabase.from('stock_bids').update({ status: 'accepted' }).eq('id', data.bidId);
      await supabase.from('stock_requests').update({ status: 'closed' }).eq('id', data.requestId);

      if (bid && request) {
        const { error: escrowError } = await supabase.from('escrow').insert({
          stock_request_id: data.requestId,
          from_seller_id: bid.bidding_seller_id,
          to_seller_id: request.requesting_seller_id,
          amount: bid.bid_price,
          status: 'held',
          description: 'Stock exchange escrow — awaiting transfer confirmation',
        });
        if (escrowError) {
          console.warn('[Bidding] escrow insert failed:', escrowError.message);
        } else {
          escrowState = 'HELD';
        }
      }
    }

    biddingNamespace.emit('bid_accepted', {
      ...data,
      escrowState,
      message: 'Escrow initiated. Awaiting physical stock confirmation.',
      openChat: true,
      fulfillmentOptions: ['dropship', 'bulk_transfer'],
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Bidding] Disconnected: ${socket.id}`);
  });
});

// /chat namespace — Global Chat Widget
const chatNamespace = io.of('/chat');
attachNamespaceAuth(chatNamespace, '/chat');
chatNamespace.on('connection', (socket) => {
  console.log(`[Chat] Connected: ${socket.id}`);

  // User joins their own personal room (using their userId) to receive direct messages
  socket.on('register_user', (userId) => {
    socket.join(userId);
    console.log(`[Chat] User ${userId} registered and joined their personal room.`);
  });

  // Handle sending a direct message
  socket.on('send_message', async (data) => {
    console.log(`[Chat] Message from ${data.senderId} to ${data.receiverId}: ${data.text}`);

    const timestamp = new Date().toISOString();
    let messageId = data.id || Date.now().toString();

    // Only insert to DB if client has not already inserted directly
    if (!data.alreadyPersisted) {
      const supabase = getSupabaseAdmin();
      if (supabase && data.senderId && data.text) {
        const { data: row, error } = await supabase
          .from('chat_messages')
          .insert({
            sender_id: data.senderId,
            receiver_id: String(data.receiverId),
            sender_name: data.senderName || 'User',
            text: data.text,
          })
          .select('id, created_at')
          .single();

        if (!error && row) {
          messageId = row.id;
        } else if (error) {
          console.warn('[Chat] DB persist failed:', error.message);
        }
      }
    }

    const payload = {
      id: messageId,
      senderId: data.senderId,
      senderName: data.senderName,
      receiverId: data.receiverId,
      text: data.text,
      timestamp,
    };

    chatNamespace.to(data.receiverId).emit('receive_message', payload);
  });

  socket.on('disconnect', () => {
    console.log(`[Chat] Disconnected: ${socket.id}`);
  });
});

// /delivery namespace — priority pings for online agents
const deliveryNamespace = io.of('/delivery');
attachNamespaceAuth(deliveryNamespace, '/delivery');
deliveryNamespace.on('connection', (socket) => {
  console.log(`[Delivery] Connected: ${socket.id}`);

  socket.on('priority_ping', (data) => {
    const ids = data?.agentIds || [];
    ids.forEach((agentId) => {
      deliveryNamespace.to(agentId).emit('priority_delivery', data);
    });
    deliveryNamespace.emit('priority_delivery', data);
  });

  socket.on('register_agent', (agentId) => {
    if (agentId) socket.join(String(agentId));
  });

  socket.on('disconnect', () => {
    console.log(`[Delivery] Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Euphoria Nexus Backend running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
