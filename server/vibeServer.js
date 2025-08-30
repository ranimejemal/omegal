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
  max: 200 // Increased for better UX
});
app.use(limiter);

// 🔌 Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

// 🔹 Enhanced data stores
const activeUsers = new Map();  // socketId -> user object
const waitingUsers = [];        // normal queue with interests
const premiumWaitingUsers = []; // premium queue
const chatRooms = new Map();    // roomId -> room object
const userInterests = new Map(); // socketId -> interests array

// 🎯 Interest-based matching algorithm
const calculateMatchScore = (interests1, interests2) => {
  if (!interests1?.length || !interests2?.length) return 0;
  
  const shared = interests1.filter(interest => interests2.includes(interest));
  const total = new Set([...interests1, ...interests2]).size;
  
  return Math.round((shared.length / Math.max(interests1.length, interests2.length)) * 100);
};

const findBestMatch = (userId, userInterests, isPremium = false) => {
  const targetQueue = isPremium ? premiumWaitingUsers : waitingUsers;
  
  let bestMatch = null;
  let bestScore = 0;
  let bestIndex = -1;

  targetQueue.forEach((waitingUser, index) => {
    const waitingUserId = typeof waitingUser === 'string' ? waitingUser : waitingUser.id;
    if (waitingUserId === userId) return;

    const waitingUserInterests = userInterests.get(waitingUserId) || [];
    const score = calculateMatchScore(userInterests, waitingUserInterests);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = waitingUser;
      bestIndex = index;
    }
  });

  // Require at least 20% match for premium, 10% for free
  const minScore = isPremium ? 20 : 10;
  if (bestScore >= minScore && bestIndex !== -1) {
    targetQueue.splice(bestIndex, 1);
    return {
      userId: typeof bestMatch === 'string' ? bestMatch : bestMatch.id,
      score: bestScore,
      sharedInterests: userInterests.filter(interest => 
        (userInterests.get(typeof bestMatch === 'string' ? bestMatch : bestMatch.id) || []).includes(interest)
      )
    };
  }

  return null;
};

// 🚫 Enhanced profanity filter
const bannedWords = [
  'spam', 'abuse', 'inappropriate', 'hate', 'toxic', 'scam',
  // Add more as needed
];

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

// 🖥️ Enhanced Socket.IO logic
io.on('connection', (socket) => {
  console.log(`✨ User connected: ${socket.id}`);

  // Register new user with enhanced data
  activeUsers.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    roomId: null,
    isSearching: false,
    interests: [],
    vibeScore: 0,
    isPremium: false
  });

  // 🔍 Enhanced partner finding with interests
  socket.on('findPartner', (data = {}) => {
    const user = activeUsers.get(socket.id);
    if (!user || user.roomId) return;

    const { interests = [], isPremium = false, userId } = data;
    
    // Store user interests
    userInterests.set(socket.id, interests);
    user.interests = interests;
    user.isPremium = isPremium;
    user.isSearching = true;

    // Try to find a match
    const match = findBestMatch(socket.id, interests, isPremium);

    if (match && activeUsers.has(match.userId)) {
      const roomId = generateRoomId();
      const matchUser = activeUsers.get(match.userId);

      // Update users
      user.roomId = matchUser.roomId = roomId;
      user.isSearching = matchUser.isSearching = false;

      // Join room
      socket.join(roomId);
      io.sockets.sockets.get(match.userId)?.join(roomId);

      // Save room with enhanced data
      chatRooms.set(roomId, {
        users: [socket.id, match.userId],
        createdAt: new Date(),
        messages: [],
        matchScore: match.score,
        sharedInterests: match.sharedInterests
      });

      // Send match data to both users
      const matchData = {
        roomId,
        partnerId: match.userId,
        sharedInterests: match.sharedInterests,
        matchScore: match.score,
        partnerUsername: `Stranger${Math.floor(Math.random() * 1000)}`
      };

      io.to(roomId).emit('partnerFound', matchData);
      console.log(`🎯 Match: ${socket.id} ↔ ${match.userId} (${match.score}% compatibility)`);
    } else {
      // Add to waiting queue
      const waitingUser = { id: socket.id, interests, isPremium };
      if (isPremium) {
        if (!premiumWaitingUsers.find(u => u.id === socket.id)) {
          premiumWaitingUsers.push(waitingUser);
        }
      } else {
        if (!waitingUsers.find(u => (typeof u === 'string' ? u : u.id) === socket.id)) {
          waitingUsers.push(waitingUser);
        }
      }
      socket.emit('searching');
    }
  });

  // 💬 Enhanced messaging with typing indicators
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

  // ⌨️ Typing indicator
  socket.on('typing', () => {
    const user = activeUsers.get(socket.id);
    if (user?.roomId) {
      socket.to(user.roomId).emit('partnerTyping');
    }
  });

  // 🔄 Skip partner (premium feature)
  socket.on('skipPartner', () => {
    const user = activeUsers.get(socket.id);
    if (!user?.roomId) return;

    // Notify partner
    socket.to(user.roomId).emit('partnerLeft');
    
    // Clean up current room
    cleanupRoom(user.roomId, socket.id);
    
    // Start new search
    user.roomId = null;
    user.isSearching = false;
    
    socket.emit('skipSuccess');
  });

  // 🎥 Video signaling (unchanged)
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

// 🔁 Forward helper (unchanged)
function forwardEvent(socket, event, payload) {
  const user = activeUsers.get(socket.id);
  if (user?.roomId) socket.to(user.roomId).emit(event, payload);
}

// 🚪 Enhanced leave chat
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

// 🧹 Enhanced cleanup helpers
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
  console.log(`👋 User disconnected: ${socketId}`);
  const user = activeUsers.get(socketId);
  if (!user) return;

  if (user.roomId) {
    const partnerId = chatRooms.get(user.roomId)?.users.find(id => id !== socketId);
    if (partnerId) io.to(partnerId).emit('partnerLeft');
    cleanupRoom(user.roomId, socketId);
  }

  removeFromQueues(socketId);
  activeUsers.delete(socketId);
  userInterests.delete(socketId);
}

// 🌐 Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✨ VibeMatch server running on port ${PORT}`));

// 📊 Enhanced user stats
setInterval(() => {
  const totalWaiting = waitingUsers.length + premiumWaitingUsers.length;
  const totalConnected = Math.max(0, activeUsers.size - totalWaiting);
  
  io.emit('userCounts', {
    matching: totalWaiting,
    connected: totalConnected
  });
}, 3000); // More frequent updates

// 🧹 Enhanced room cleanup
setInterval(() => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  for (const [roomId, room] of chatRooms) {
    if (room.createdAt < twoHoursAgo) {
      console.log(`🧹 Cleaning up old room: ${roomId}`);
      cleanupRoom(roomId, null);
    }
  }
}, 15 * 60 * 1000); // Every 15 minutes

// 🎉 Daily rewards system (simulate)
setInterval(() => {
  // Award daily login bonus to active users
  for (const [socketId, user] of activeUsers) {
    if (user.lastDailyReward !== new Date().toDateString()) {
      user.vibeCoins = (user.vibeCoins || 0) + 10;
      user.lastDailyReward = new Date().toDateString();
      io.to(socketId).emit('dailyReward', { coins: 10 });
    }
  }
}, 60 * 60 * 1000); // Every hour