const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

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
biddingNamespace.on('connection', (socket) => {
  console.log(`[Bidding] Connected: ${socket.id}`);

  // Seller posts a stock request
  socket.on('post_request', (data) => {
    console.log(`[Bidding] post_request:`, data);
    // Broadcast to all sellers in the bidding room
    socket.broadcast.emit('new_stock_request', data);
  });

  // Another seller submits an anonymous blind bid
  socket.on('submit_bid', (data) => {
    console.log(`[Bidding] submit_bid:`, data);
    // Notify the requesting seller (in their room)
    socket.to(data.requesterId).emit('bid_received', {
      bidId: `bid_${Date.now()}`,
      amount: data.amount,
      quantity: data.quantity,
      // anonymized — no seller info sent
    });
  });

  // Requesting seller accepts a bid — triggers escrow
  socket.on('accept_bid', (data) => {
    console.log(`[Bidding] accept_bid:`, data);
    biddingNamespace.emit('bid_accepted', {
      ...data,
      escrowState: 'PENDING_TRANSFER',
      message: 'Escrow initiated. Awaiting physical stock confirmation.',
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Bidding] Disconnected: ${socket.id}`);
  });
});

// /chat namespace — Global Chat Widget
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
  console.log(`[Chat] Connected: ${socket.id}`);

  // User joins their own personal room (using their userId) to receive direct messages
  socket.on('register_user', (userId) => {
    socket.join(userId);
    console.log(`[Chat] User ${userId} registered and joined their personal room.`);
  });

  // Handle sending a direct message
  socket.on('send_message', (data) => {
    console.log(`[Chat] Message from ${data.senderId} to ${data.receiverId}: ${data.text}`);
    
    // Broadcast to the receiver's personal room
    chatNamespace.to(data.receiverId).emit('receive_message', {
      id: Date.now().toString(),
      senderId: data.senderId,
      senderName: data.senderName,
      receiverId: data.receiverId,
      text: data.text,
      timestamp: new Date().toISOString()
    });
    
    // Also echo back to the sender so they can see their own message if they have multiple tabs open
    chatNamespace.to(data.senderId).emit('receive_message', {
      id: Date.now().toString(),
      senderId: data.senderId,
      senderName: data.senderName,
      receiverId: data.receiverId,
      text: data.text,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Chat] Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Euphoria Nexus Backend running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
