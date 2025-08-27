import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Message, ChatStatus } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

export const useChat = (socket: Socket | null, premiumPreferences?: any, isPremium?: boolean) => {
  const [status, setStatus] = useState<ChatStatus>(ChatStatus.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
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
  }, [socket, status, addMessage]);

  const findPartner = useCallback(() => {
    if (!socket) return;
    
    setMessages([]);
    setRoomId(null);
    socket.emit('findPartner', { premiumPreferences: isPremium ? premiumPreferences : null });
  }, [socket, premiumPreferences, isPremium]);

  const endChat = useCallback(() => {
    if (!socket) return;
    
    socket.emit('leaveChat');
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleSearching = () => {
      setStatus(ChatStatus.SEARCHING);
    };

    const handlePartnerFound = (data: { roomId: string }) => {
      setStatus(ChatStatus.CONNECTED);
      setRoomId(data.roomId);
      addMessage({
        message: 'Connected to a new partner! Say hello!',
        timestamp: new Date().toISOString(),
        senderId: 'system',
        isOwn: false,
      });
    };

    const handleMessageReceived = (data: Message) => {
      addMessage({
        ...data,
        isOwn: false,
      });
    };

    const handlePartnerLeft = () => {
      setStatus(ChatStatus.DISCONNECTED);
      setRoomId(null);
      addMessage({
        message: 'Your partner has left the chat.',
        timestamp: new Date().toISOString(),
        senderId: 'system',
        isOwn: false,
      });
    };

    const handleChatEnded = () => {
      setStatus(ChatStatus.DISCONNECTED);
      setRoomId(null);
    };

    socket.on('searching', handleSearching);
    socket.on('partnerFound', handlePartnerFound);
    socket.on('messageReceived', handleMessageReceived);
    socket.on('partnerLeft', handlePartnerLeft);
    socket.on('chatEnded', handleChatEnded);

    return () => {
      socket.off('searching', handleSearching);
      socket.off('partnerFound', handlePartnerFound);
      socket.off('messageReceived', handleMessageReceived);
      socket.off('partnerLeft', handlePartnerLeft);
      socket.off('chatEnded', handleChatEnded);
    };
  }, [socket, addMessage]);

  return {
    status,
    messages,
    roomId,
    sendMessage,
    findPartner,
    endChat,
  };
};