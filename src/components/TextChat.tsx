import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Video } from 'lucide-react';
import { Message } from '../types/chat';

interface TextChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onVideoIconClick: () => void;
  isConnected: boolean;
  canRequestVideo: boolean;
}

export const TextChat: React.FC<TextChatProps> = ({
  messages,
  onSendMessage,
  onVideoIconClick,
  isConnected,
  canRequestVideo,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const interests = ['Technology', 'Sports', 'Music', 'Travel','Cooking',
  'Photography',
  'Movies',
  'Fitness',
  'Art',
  'Gaming', 'Anime','cinema',
  'Manga',
  'K-Pop',
  'Cosplay',
  'Streaming',
  'Memes','business','trading',];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col w-screen bg-white">
      {/* Main Content: Left / Chat / Right */}
      <div className="flex space-x-3 p-4" style={{ height: '600px' }}>
        {/* Left: Subscription Panel */}
        <div className="w-64 flex-shrink-0 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-between h-full">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">
            Go Premium
          </button>
        </div>

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded-lg overflow-hidden h-full">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation with your partner!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        message.isOwn
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="break-words">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isConnected
                    ? 'Type a message...'
                    : 'Connect to a partner to chat'
                }
                disabled={!isConnected}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={500}
              />

              <button
                type="button"
                onClick={onVideoIconClick}
                disabled={!canRequestVideo}
                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                  canRequestVideo
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={
                  canRequestVideo
                    ? 'Request video chat'
                    : 'Connect to request video'
                }
              >
                <Video size={20} />
              </button>

              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{newMessage.length}/500</span>
              {isConnected && (
                <span className="text-green-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Connected
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right: Free / Interests */}
<div className="w-64 flex-shrink-0 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col h-full">
  <h2 className="text-lg font-semibold mb-4 font-bold text-center">Interests</h2>
  <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2">
    {interests.map((interest) => (
      <button
        key={interest}
        onClick={() => toggleInterest(interest)}
        className={`text-sm px-2 py-1 rounded-md transition-colors ${
          selectedInterests.includes(interest)
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        {interest}
      </button>
    ))}
  </div>
</div>


      </div>
    </div>
  );
};
