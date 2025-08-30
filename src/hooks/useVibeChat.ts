import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Message, ChatStatus } from '../types/chat';
import { User, MatchResult } from '../types/user';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export const useVibeChat = (socket: Socket | null, user: User | null) => {
  const [status, setStatus] = useState<ChatStatus>(ChatStatus.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  const addMessage = useCallback((message: Omit<Message, 'id'> & { id?: string }) => {
    const newMessage: Message = {
      ...message,
      id: message.id || uuidv4(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const sendMessage = useCallback((messageText: string) => {
    if (!socket || status !== ChatStatus.CONNECTED) return;

    const message: Message = {
      id: uuidv4(),
      message: messageText,
      timestamp: new Date().toISOString(),
      senderId: socket.id || '',
      isOwn: true,
    };

    addMessage(message);
    socket.emit('sendMessage', { message: messageText });

    // Update vibe score
    if (user) {
      user.vibeScore += 1;
    }
  }, [socket, status, addMessage, user]);

  const findPartner = useCallback((interests: string[]) => {
    if (!socket || !user) return;
    
    setMessages([]);
    setCurrentMatch(null);
    setRoomId(null);
    setStatus(ChatStatus.SEARCHING);
    
    socket.emit('findPartner', { 
      interests,
      userId: user.id,
      isPremium: user.isPremium,
      preferences: user.isPremium ? {} : null
    });
  }, [socket, user]);

  const skipPartner = useCallback(() => {
    if (!socket || !user) return;

    // Cost 5 coins to skip
    if (user.vibeCoins >= 5) {
      user.vibeCoins -= 5;
      socket.emit('skipPartner');
      toast.success('Searching for a new partner...');
    } else {
      toast.error('Not enough coins to skip! Need 5 coins.');
    }
  }, [socket, user]);

  const endChat = useCallback(() => {
    if (!socket) return;
    
    socket.emit('leaveChat');
    
    // Award coins for completing a chat
    if (user && messages.length > 5) {
      user.vibeCoins += 10;
      user.totalChats += 1;
      toast.success('+10 coins for a great chat!');
    }
  }, [socket, user, messages.length]);

  const sendTypingIndicator = useCallback(() => {
    if (!socket || status !== ChatStatus.CONNECTED) return;
    socket.emit('typing');
  }, [socket, status]);

  useEffect(() => {
    if (!socket) return;

    const handleSearching = () => {
      setStatus(ChatStatus.SEARCHING);
    };

    const handlePartnerFound = (data: { 
      roomId: string; 
      match: MatchResult;
    }) => {
      setStatus(ChatStatus.CONNECTED);
      setRoomId(data.roomId);
      setCurrentMatch(data.match);
      
      const sharedInterestNames = data.match.sharedInterests.map(id => 
        id.charAt(0).toUpperCase() + id.slice(1)
      ).join(', ');

      addMessage({
        message: `🎉 You matched because you both love: ${sharedInterestNames}! Say hello!`,
        timestamp: new Date().toISOString(),
        senderId: 'system',
        isOwn: false,
      });

      toast.success(`${data.match.matchScore}% match found!`);
    };

    const handleMessageReceived = (data: Message) => {
      addMessage({
        ...data,
        isOwn: false,
      });
    };

    const handlePartnerLeft = () => {
      setStatus(ChatStatus.DISCONNECTED);
      setCurrentMatch(null);
      setRoomId(null);
      addMessage({
        message: 'Your partner has left the chat. Thanks for the conversation!',
        timestamp: new Date().toISOString(),
        senderId: 'system',
        isOwn: false,
      });
      toast('Partner left the chat', { icon: '👋' });
    };

    const handleChatEnded = () => {
      setStatus(ChatStatus.DISCONNECTED);
      setCurrentMatch(null);
      setRoomId(null);
    };

    const handleTyping = () => {
      setTypingIndicator(true);
      setTimeout(() => setTypingIndicator(false), 3000);
    };

    const handleSkipSuccess = () => {
      setStatus(ChatStatus.SEARCHING);
      setMessages([]);
      setCurrentMatch(null);
    };

    socket.on('searching', handleSearching);
    socket.on('partnerFound', handlePartnerFound);
    socket.on('messageReceived', handleMessageReceived);
    socket.on('partnerLeft', handlePartnerLeft);
    socket.on('chatEnded', handleChatEnded);
    socket.on('partnerTyping', handleTyping);
    socket.on('skipSuccess', handleSkipSuccess);

    return () => {
      socket.off('searching', handleSearching);
      socket.off('partnerFound', handlePartnerFound);
      socket.off('messageReceived', handleMessageReceived);
      socket.off('partnerLeft', handlePartnerLeft);
      socket.off('chatEnded', handleChatEnded);
      socket.off('partnerTyping', handleTyping);
      socket.off('skipSuccess', handleSkipSuccess);
    };
  }, [socket, addMessage]);

  return {
    status,
    messages,
    currentMatch,
    typingIndicator,
    roomId,
    sendMessage,
    findPartner,
    skipPartner,
    endChat,
    sendTypingIndicator,
  };
};