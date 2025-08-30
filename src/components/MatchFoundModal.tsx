import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Heart, MessageCircle, Video, Sparkles } from 'lucide-react';
import { MatchResult } from '../types/user';
import { INTERESTS } from '../types/interests';

interface MatchFoundModalProps {
  match: MatchResult;
  onStartChat: (type: 'text' | 'video') => void;
  onSkip: () => void;
}

export const MatchFoundModal: React.FC<MatchFoundModalProps> = ({
  match,
  onStartChat,
  onSkip
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const sharedInterestNames = match.sharedInterests.map(id => 
    INTERESTS.find(interest => interest.id === id)?.name || id
  );

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfect Match!</h2>
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">{match.matchScore}% compatibility</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Partner Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {match.partnerUsername?.[0] || '?'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {match.partnerUsername || 'Anonymous User'}
                </h3>
                <p className="text-sm text-gray-600">Ready to chat!</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">You both love:</p>
              <div className="flex flex-wrap gap-2">
                {sharedInterestNames.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-600 shadow-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartChat('video')}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Video className="w-5 h-5" />
              <span>Start Video Chat</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartChat('text')}
              className="w-full py-3 bg-white border-2 border-purple-200 text-purple-600 font-semibold rounded-xl flex items-center justify-center space-x-2 hover:bg-purple-50 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Text Chat</span>
            </motion.button>

            <button
              onClick={onSkip}
              className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              Skip this match
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};