const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Next.js frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Euphoria Nexus Backend is running' });
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

const negotiationsNamespace = io.of('/negotiations');
negotiationsNamespace.on('connection', (socket) => {
  console.log(`[Socket] User connected to /negotiations: ${socket.id}`);
  
  socket.on('propose_price', (data) => {
    console.log(`[Negotiations] propose_price received:`, data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected from /negotiations: ${socket.id}`);
  });
});

const biddingNamespace = io.of('/bidding');
biddingNamespace.on('connection', (socket) => {
  console.log(`[Socket] User connected to /bidding: ${socket.id}`);

  socket.on('submit_bid', (data) => {
    console.log(`[Bidding] submit_bid received:`, data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected from /bidding: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});
