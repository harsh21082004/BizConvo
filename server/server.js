const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversation');
const chatSockets = require('./sockets/chatSocket');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'https://biz-convo.vercel.app', // Update with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any headers your frontend might be sending
  credentials: true 
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://biz-convo.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Respond OK to preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversation', conversationRoutes);

// Socket.IO setup
chatSockets(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
