import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Video, Phone, Heart, Smile, Gift, MoreHorizontal } from 'lucide-react';
import { Message } from '../types/chat';
import { MatchResult } from '../types/user';
import { INTERESTS } from '../types/interests';

interface VibeTextChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onVideoRequest: () => void;
  onVoiceRequest: () => void;
  onEndChat: () => void;
  onSkipPartner: () => void;
  match: MatchResult | null;
  isConnected: boolean;
  canRequestVideo: boolean;
  typingIndicator?: boolean;
}

export const VibeTextChat: React.FC<VibeTextChatProps> = ({
  messages,
  onSendMessage,
  onVideoRequest,
  onVoiceRequest,
  onEndChat,
  onSkipPartner,
  match,
  isConnected,
  canRequestVideo,
  typingIndicator = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '✨', '🎉', '😍', '🤔', '👋', '💯', '🙌'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Match Header */}
      {match && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border-b border-purple-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {match.partnerUsername?.[0] || '?'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {match.partnerUsername || 'Anonymous'}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600 font-medium">
                      {match.matchScore}% match
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {match.sharedInterests.length} shared interest{match.sharedInterests.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onVideoRequest}
                disabled={!canRequestVideo}
                className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Video className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onVoiceRequest}
                disabled={!canRequestVideo}
                className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSkipPartner}
                className="p-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MoreHorizontal className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Shared Interests */}
          {match.sharedInterests.length > 0 && (
            <div className="mt-3 p-3 bg-white/60 rounded-xl">
              <p className="text-xs font-medium text-gray-600 mb-2">You both love:</p>
              <div className="flex flex-wrap gap-2">
                {match.sharedInterests.slice(0, 3).map((interestId) => {
                  const interest = INTERESTS.find(i => i.id === interestId);
                  return (
                    <span
                      key={interestId}
                      className={`px-2 py-1 bg-gradient-to-r ${interest?.color || 'from-gray-400 to-gray-500'} text-white text-xs rounded-full shadow-sm`}
                    >
                      {interest?.icon} {interest?.name}
                    </span>
                  );
                })}
                {match.sharedInterests.length > 3 && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    +{match.sharedInterests.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  message.isOwn
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                }`}
              >
                <p className="break-words">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.isOwn ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-lg border border-gray-100">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/80 backdrop-blur-lg border-t border-purple-100">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isConnected ? 'Type your message...' : 'Connect to start chatting'}
              disabled={!isConnected}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
              maxLength={500}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 grid grid-cols-6 gap-2 z-10"
              >
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>

        {/* Character count and status */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{newMessage.length}/500</span>
          {isConnected && (
            <div className="flex items-center space-x-1 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Connected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};