import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);

// 🔒 Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true
}));

// 🚨 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// 🔌 Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

// 🔹 Data stores
const activeUsers = new Map();  // socketId -> user object
const waitingUsers = [];        // normal queue
const premiumWaitingUsers = []; // premium queue
const chatRooms = new Map();    // roomId -> room object

// 🚫 Profanity filter
const bannedWords = ['spam', 'abuse', 'inappropriate'];
const filterMessage = (message) => {
  let filtered = message;
  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};

// 🎲 Utility functions
const generateRoomId = () => uuidv4();

const findMatch = (userId, preferences = null) => {
  let targetQueue = preferences ? premiumWaitingUsers : waitingUsers;

  // Try matching in the selected queue
  const matchIndex = targetQueue.findIndex(u => {
    const waitingUser = typeof u === 'string' ? { id: u } : u;
    if (waitingUser.id === userId) return false;

    if (!preferences || !waitingUser.preferences) return true;

    // Gender check
    if (
      preferences.gender && preferences.gender !== 'Any' &&
      waitingUser.preferences?.gender && waitingUser.preferences.gender !== 'Any' &&
      preferences.gender !== waitingUser.preferences.gender
    ) return false;

    // Nationality check
    if (
      preferences.nationality && preferences.nationality !== 'Any' &&
      waitingUser.preferences?.nationality && waitingUser.preferences.nationality !== 'Any' &&
      preferences.nationality !== waitingUser.preferences.nationality
    ) return false;

    // Country check
    if (
      preferences.country && preferences.country !== 'Any' &&
      waitingUser.preferences?.country && waitingUser.preferences.country !== 'Any' &&
      preferences.country !== waitingUser.preferences.country
    ) return false;

    return true;
  });

  if (matchIndex === -1) return null;
  const match = targetQueue.splice(matchIndex, 1)[0];
  return typeof match === 'string' ? match : match.id;
};

// 🖥️ Socket.IO logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register new user
  activeUsers.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    roomId: null,
    isSearching: false
  });

  // 🔍 Find a chat partner
  socket.on('findPartner', (data = {}) => {
    const user = activeUsers.get(socket.id);
    if (!user || user.roomId) return;

    user.isSearching = true;
    const matchId = findMatch(socket.id, data.premiumPreferences);

    if (matchId && activeUsers.has(matchId)) {
      const roomId = generateRoomId();
      const matchUser = activeUsers.get(matchId);

      // Update users
      user.roomId = matchUser.roomId = roomId;
      user.isSearching = matchUser.isSearching = false;

      // Join room
      socket.join(roomId);
      io.sockets.sockets.get(matchId)?.join(roomId);

      // Save room
      chatRooms.set(roomId, {
        users: [socket.id, matchId],
        createdAt: new Date(),
        messages: []
      });

      io.to(roomId).emit('partnerFound', { roomId });
      console.log(`Match: ${socket.id} ↔ ${matchId} in ${roomId}`);
    } else {
      const waitingUser = { id: socket.id, preferences: data.premiumPreferences };
      if (data.premiumPreferences) {
        if (!premiumWaitingUsers.find(u => u.id === socket.id)) premiumWaitingUsers.push(waitingUser);
      } else {
        if (!waitingUsers.includes(socket.id)) waitingUsers.push(socket.id);
      }
      socket.emit('searching');
    }
  });

  // 💬 Messaging
  socket.on('sendMessage', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user?.roomId) return;

    const room = chatRooms.get(user.roomId);
    if (!room) return;

    const messageData = {
      id: uuidv4(),
      message: filterMessage(data.message),
      timestamp: new Date().toISOString(),
      senderId: socket.id
    };

    room.messages.push(messageData);
    socket.to(user.roomId).emit('messageReceived', messageData);
  });

  // 🎥 Video signaling
  socket.on('videoRequest', () => forwardEvent(socket, 'videoRequest', { from: socket.id }));
  socket.on('videoRequestResponse', (data) => forwardEvent(socket, data.accepted ? 'videoRequestAccepted' : 'videoRequestRejected'));
  socket.on('videoOffer', (data) => forwardEvent(socket, 'videoOffer', { offer: data.offer, senderId: socket.id }));
  socket.on('videoAnswer', (data) => forwardEvent(socket, 'videoAnswer', { answer: data.answer, senderId: socket.id }));
  socket.on('iceCandidate', (data) => forwardEvent(socket, 'iceCandidate', { candidate: data.candidate, senderId: socket.id }));

  // 🛑 Leave chat
  socket.on('leaveChat', () => leaveChat(socket));

  // ❌ Disconnect
  socket.on('disconnect', () => handleDisconnection(socket.id));
});

// 🔁 Forward helper
function forwardEvent(socket, event, payload) {
  const user = activeUsers.get(socket.id);
  if (user?.roomId) socket.to(user.roomId).emit(event, payload);
}

// 🚪 Leave chat
function leaveChat(socket) {
  const user = activeUsers.get(socket.id);
  if (!user) return;

  if (user.roomId) {
    socket.to(user.roomId).emit('partnerLeft');
    cleanupRoom(user.roomId, socket.id);
  }

  user.roomId = null;
  user.isSearching = false;
  removeFromQueues(socket.id);
  socket.emit('chatEnded');
}

// 🧹 Cleanup helpers
function cleanupRoom(roomId, leavingUserId) {
  const room = chatRooms.get(roomId);
  if (!room) return;

  const partnerId = room.users.find(id => id !== leavingUserId);
  if (partnerId && activeUsers.has(partnerId)) {
    const partner = activeUsers.get(partnerId);
    partner.roomId = null;
    partner.isSearching = false;
    io.sockets.sockets.get(partnerId)?.leave(roomId);
  }

  chatRooms.delete(roomId);
}

function removeFromQueues(userId) {
  const remove = (arr) => {
    const idx = arr.findIndex(u => (typeof u === 'string' ? u : u.id) === userId);
    if (idx !== -1) arr.splice(idx, 1);
  };
  remove(waitingUsers);
  remove(premiumWaitingUsers);
}

function handleDisconnection(socketId) {
  console.log(`User disconnected: ${socketId}`);
  const user = activeUsers.get(socketId);
  if (!user) return;

  if (user.roomId) {
    const partnerId = chatRooms.get(user.roomId)?.users.find(id => id !== socketId);
    if (partnerId) io.to(partnerId).emit('partnerLeft');
    cleanupRoom(user.roomId, socketId);
  }

  removeFromQueues(socketId);
  activeUsers.delete(socketId);
}

// 🌐 Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 📊 User stats
setInterval(() => {
  io.emit('userCounts', {
    matching: waitingUsers.length + premiumWaitingUsers.length,
    connected: activeUsers.size - waitingUsers.length - premiumWaitingUsers.length
  });
}, 5000);

// 🧹 Room cleanup
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [roomId, room] of chatRooms) {
    if (room.createdAt < oneHourAgo) cleanupRoom(roomId, null);
  }
}, 10 * 60 * 1000);
