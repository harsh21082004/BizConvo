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
const io = socketio(server);


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));


// Routes

app.get("/", (req, res) => {
  res.json("Hello");
});


app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversation', conversationRoutes);

// Socket.IO setup
chatSockets(io);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
