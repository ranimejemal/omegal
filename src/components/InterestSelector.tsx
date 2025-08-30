import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { INTERESTS, INTEREST_CATEGORIES, Interest } from '../types/interests';

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  onComplete: () => void;
  isOnboarding?: boolean;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onInterestsChange,
  onComplete,
  isOnboarding = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const toggleInterest = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    onInterestsChange(newInterests);
  };

  const filteredInterests = selectedCategory
    ? INTERESTS.filter(interest => interest.category === selectedCategory)
    : INTERESTS;

  const trendingInterests = INTERESTS.filter(interest => interest.trending).slice(0, 6);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl w-full border border-white/20"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">What's Your Vibe?</h2>
            <p className="text-gray-300">Select at least 3 interests to find your perfect match</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="trending"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">🔥</span> Trending Now
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {trendingInterests.map((interest) => (
                    <InterestChip
                      key={interest.id}
                      interest={interest}
                      isSelected={selectedInterests.includes(interest.id)}
                      onClick={() => toggleInterest(interest.id)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
                >
                  See All Categories
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {INTEREST_CATEGORIES.map((category) => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory(category);
                        setStep(2);
                      }}
                      className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/20"
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(0)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ← Back to Trending
                </button>
              </motion.div>
            )}

            {step === 2 && selectedCategory && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{selectedCategory}</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredInterests.map((interest) => (
                    <InterestChip
                      key={interest.id}
                      interest={interest}
                      isSelected={selectedInterests.includes(interest.id)}
                      onClick={() => toggleInterest(interest.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedInterests.length >= 3 ? 1 : 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={onComplete}
              disabled={selectedInterests.length < 3}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
            >
              Continue ({selectedInterests.length}/3+)
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Regular interest selector (non-onboarding)
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Your Interests</h3>
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {INTERESTS.map((interest) => (
          <InterestChip
            key={interest.id}
            interest={interest}
            isSelected={selectedInterests.includes(interest.id)}
            onClick={() => toggleInterest(interest.id)}
            compact
          />
        ))}
      </div>
    </div>
  );
};

interface InterestChipProps {
  interest: Interest;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

const InterestChip: React.FC<InterestChipProps> = ({
  interest,
  isSelected,
  onClick,
  compact = false
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${compact ? 'p-2 text-sm' : 'p-4'}
        rounded-xl font-medium transition-all duration-300 border-2
        ${isSelected
          ? `bg-gradient-to-r ${interest.color} text-white border-white/50 shadow-lg`
          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
        }
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        <span className={compact ? 'text-lg' : 'text-2xl'}>{interest.icon}</span>
        <span>{interest.name}</span>
      </div>
    </motion.button>
  );
};