import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST']
  }
});

// Store for active users and chat rooms
const activeUsers = new Map();
const waitingUsers = [];
const premiumWaitingUsers = [];
const chatRooms = new Map();

// Profanity filter - basic implementation
const bannedWords = ['spam', 'abuse', 'inappropriate']; // Add more as needed
const filterMessage = (message) => {
  let filtered = message;
  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};

// Generate room ID
const generateRoomId = () => uuidv4();

// Find a match for user
const findMatch = (userId, preferences = null) => {
  let targetQueue = waitingUsers;
  
  // If user has premium preferences, try premium queue first
  if (preferences) {
    targetQueue = premiumWaitingUsers;
    
    // Find matching user with compatible preferences
    const matchIndex = targetQueue.findIndex(waitingUser => {
      if (waitingUser.id === userId) return false;
      
      // Check if preferences are compatible
      const userPrefs = preferences;
      const waitingPrefs = waitingUser.preferences;
      
      if (!userPrefs || !waitingPrefs) return true; // If either has no preferences, match
      
      // Check gender compatibility
      if (userPrefs.gender && userPrefs.gender !== 'Any' && 
          waitingPrefs.gender && waitingPrefs.gender !== 'Any' &&
          userPrefs.gender !== waitingPrefs.gender) return false;
          
      // Check nationality compatibility  
      if (userPrefs.nationality && userPrefs.nationality !== 'Any' &&
          waitingPrefs.nationality && waitingPrefs.nationality !== 'Any' &&
          userPrefs.nationality !== waitingPrefs.nationality) return false;
          
      // Check country compatibility
      if (userPrefs.country && userPrefs.country !== 'Any' &&
          waitingPrefs.country && waitingPrefs.country !== 'Any' &&
          userPrefs.country !== waitingPrefs.country) return false;
          
      return true;
    });
    
    if (matchIndex !== -1) {
      const match = targetQueue[matchIndex];
      targetQueue.splice(matchIndex, 1);
      return match.id;
    }
  }
  
  // Fall back to regular queue
  const matchIndex = waitingUsers.findIndex(waitingUser => {
    return (typeof waitingUser === 'string' ? waitingUser : waitingUser.id) !== userId;
  });
  
  if (matchIndex === -1) return null;
  
  const match = waitingUsers[matchIndex];
  waitingUsers.splice(matchIndex, 1);
  return typeof match === 'string' ? match : match.id;
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Store user info
  activeUsers.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    roomId: null,
    isSearching: false
  });

  // Handle finding a chat partner
  socket.on('findPartner', (data = {}) => {
    const user = activeUsers.get(socket.id);
    if (!user || user.roomId) return;

    user.isSearching = true;
    const matchId = findMatch(socket.id, data.premiumPreferences);

    if (matchId && activeUsers.has(matchId)) {
      // Create new chat room
      const roomId = generateRoomId();
      const matchUser = activeUsers.get(matchId);

      // Update both users
      user.roomId = roomId;
      user.isSearching = false;
      matchUser.roomId = roomId;
      matchUser.isSearching = false;

      // Join both users to the room
      socket.join(roomId);
      io.sockets.sockets.get(matchId)?.join(roomId);

      // Store room info
      chatRooms.set(roomId, {
        users: [socket.id, matchId],
        createdAt: new Date(),
        messages: []
      });

      // Notify both users
      io.to(roomId).emit('partnerFound', { roomId });
      
      console.log(`Match found: ${socket.id} and ${matchId} in room ${roomId}`);
    } else {
      // Add to waiting queue
      const waitingUser = {
        id: socket.id,
        preferences: data.premiumPreferences
      };
      
      if (data.premiumPreferences) {
        if (!premiumWaitingUsers.find(u => u.id === socket.id)) {
          premiumWaitingUsers.push(waitingUser);
        }
      } else {
        if (!waitingUsers.find(u => (typeof u === 'string' ? u : u.id) === socket.id)) {
          waitingUsers.push(socket.id);
        }
      }
      socket.emit('searching');
    }
  });

  // Handle text messages
  socket.on('sendMessage', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user || !user.roomId) return;

    const room = chatRooms.get(user.roomId);
    if (!room) return;

    // Filter message for inappropriate content
    const filteredMessage = filterMessage(data.message);
    
    const messageData = {
      id: uuidv4(),
      message: filteredMessage,
      timestamp: new Date().toISOString(),
      senderId: socket.id
    };

    // Store message in room
    room.messages.push(messageData);

    // Send to other user in room
    socket.to(user.roomId).emit('messageReceived', messageData);
  });

  // Handle video chat requests
  socket.on('videoRequest', () => {
    const user = activeUsers.get(socket.id);
    if (!user || !user.roomId) return;

    socket.to(user.roomId).emit('videoRequest', { from: socket.id });
  });

  socket.on('videoRequestResponse', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user || !user.roomId) return;

    if (data.accepted) {
      socket.to(user.roomId).emit('videoRequestAccepted');
    } else {
      socket.to(user.roomId).emit('videoRequestRejected');
    }
  });

  // Handle video chat signaling
  socket.on('videoOffer', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user || !user.roomId) return;

    socket.to(user.roomId).emit('videoOffer', {
      offer: data.offer,
      senderId: socket.id
    });
  });

  socket.on('videoAnswer', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user || !user.roomId) return;

    socket.to(user.roomId).emit('videoAnswer', {
      answer: data.answer,
      senderId: socket.id
    });
  });

  socket.on('iceCandidate', (data) => {
    const user = activeUsers.get(socket.id);
    if (!user || !user.roomId) return;

    socket.to(user.roomId).emit('iceCandidate', {
      candidate: data.candidate,
      senderId: socket.id
    });
  });

  // Handle disconnection from current chat
  socket.on('disconnect', () => {
    handleDisconnection(socket.id);
  });

  socket.on('leaveChat', () => {
    const user = activeUsers.get(socket.id);
    if (user && user.roomId) {
      // Notify partner
      socket.to(user.roomId).emit('partnerLeft');
      
      // Clean up room
      cleanupRoom(user.roomId, socket.id);
    }
    
    // Reset user state
    if (user) {
      user.roomId = null;
      user.isSearching = false;
    }

    // Remove from waiting queue
    const waitingIndex = waitingUsers.findIndex(u => (typeof u === 'string' ? u : u.id) === socket.id);
    if (waitingIndex > -1) {
      waitingUsers.splice(waitingIndex, 1);
    }
    
    const premiumWaitingIndex = premiumWaitingUsers.findIndex(u => u.id === socket.id);
    if (premiumWaitingIndex > -1) {
      premiumWaitingUsers.splice(premiumWaitingIndex, 1);
    }

    socket.emit('chatEnded');
  });
});

// Clean up functions
const cleanupRoom = (roomId, leavingUserId) => {
  const room = chatRooms.get(roomId);
  if (!room) return;

  // Update remaining user
  const remainingUserId = room.users.find(id => id !== leavingUserId);
  if (remainingUserId && activeUsers.has(remainingUserId)) {
    const remainingUser = activeUsers.get(remainingUserId);
    remainingUser.roomId = null;
    remainingUser.isSearching = false;
    
    // Leave the room
    const remainingSocket = io.sockets.sockets.get(remainingUserId);
    if (remainingSocket) {
      remainingSocket.leave(roomId);
    }
  }

  // Delete room
  chatRooms.delete(roomId);
};

const handleDisconnection = (socketId) => {
  console.log('User disconnected:', socketId);
  
  const user = activeUsers.get(socketId);
  if (user) {
    // Clean up room if user was in one
    if (user.roomId) {
      const room = chatRooms.get(user.roomId);
      if (room) {
        // Notify partner
        const partnerId = room.users.find(id => id !== socketId);
        if (partnerId) {
          io.to(partnerId).emit('partnerLeft');
        }
        cleanupRoom(user.roomId, socketId);
      }
    }

    // Remove from waiting queue
    const waitingIndex = waitingUsers.findIndex(u => (typeof u === 'string' ? u : u.id) === socketId);
    if (waitingIndex > -1) {
      waitingUsers.splice(waitingIndex, 1);
    }
    
    const premiumWaitingIndex = premiumWaitingUsers.findIndex(u => u.id === socketId);
    if (premiumWaitingIndex > -1) {
      premiumWaitingUsers.splice(premiumWaitingIndex, 1);
    }

    // Remove user
    activeUsers.delete(socketId);
  }
};

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Broadcast user counts every 5 seconds
setInterval(() => {
  const counts = {
    matching: waitingUsers.length + premiumWaitingUsers.length,
    connected: activeUsers.size - waitingUsers.length - premiumWaitingUsers.length
  };
  
  io.emit('userCounts', counts);
}, 5000);

// Cleanup intervals
setInterval(() => {
  // Remove stale rooms (older than 1 hour with no activity)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [roomId, room] of chatRooms) {
    if (room.createdAt < oneHourAgo) {
      cleanupRoom(roomId, null);
    }
  }
}, 10 * 60 * 1000); // Run every 10 minutes