import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Zap } from 'lucide-react';

interface MatchingScreenProps {
  selectedInterests: string[];
  onCancel: () => void;
}

export const MatchingScreen: React.FC<MatchingScreenProps> = ({
  selectedInterests,
  onCancel
}) => {
  const [searchText, setSearchText] = useState('Searching for your vibe...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const messages = [
      'Searching for your vibe...',
      'Finding someone awesome...',
      'Matching interests...',
      'Almost there...'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setSearchText(messages[messageIndex]);
    }, 2000);

    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated Globe */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 mx-auto mb-8 relative"
        >
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <Users className="w-16 h-16 text-white" />
          </div>
          
          {/* Orbiting elements */}
          {selectedInterests.slice(0, 3).map((interestId, index) => {
            const interest = selectedInterests[index];
            return (
              <motion.div
                key={interestId}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3 + index,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0"
                style={{
                  transformOrigin: '50% 50%'
                }}
              >
                <div
                  className="absolute w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-sm"
                  style={{
                    top: `${20 + index * 15}%`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {index === 0 ? '🎵' : index === 1 ? '🎮' : '✈️'}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search Text */}
        <motion.h2
          key={searchText}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {searchText}{dots}
        </motion.h2>

        <p className="text-gray-300 mb-8">
          Looking for someone who shares your interests
        </p>

        {/* Selected Interests */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md mx-auto">
          {selectedInterests.slice(0, 5).map((interestId, index) => (
            <motion.div
              key={interestId}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm border border-white/30"
            >
              {INTERESTS.find(i => i.id === interestId)?.name || interestId}
            </motion.div>
          ))}
          {selectedInterests.length > 5 && (
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm border border-white/30">
              +{selectedInterests.length - 5} more
            </div>
          )}
        </div>

        {/* Pulse Animation */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-4 h-4 bg-purple-400 rounded-full mx-auto mb-8"
        />

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/30"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
};