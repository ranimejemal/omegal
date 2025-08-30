import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Zap, Crown, Settings, TrendingUp } from 'lucide-react';
import { User } from '../types/user';
import { InterestSelector } from './InterestSelector';

interface HomeScreenProps {
  user: User;
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  onStartMatching: () => void;
  onPremiumUpgrade: () => void;
  onSettingsClick: () => void;
  userCounts: { matching: number; connected: number };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  selectedInterests,
  onInterestsChange,
  onStartMatching,
  onPremiumUpgrade,
  onSettingsClick,
  userCounts
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - User Profile & Stats */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {user.username?.[0] || 'U'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {user.username || 'Anonymous User'}
                </h3>
                
                {user.isPremium && (
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-600 font-medium text-sm">
                      {user.premiumTier?.toUpperCase()} MEMBER
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{user.vibeScore}</div>
                    <div className="text-xs text-gray-600">Vibe Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{user.totalChats}</div>
                    <div className="text-xs text-gray-600">Total Chats</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl">
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-700">{user.vibeCoins} Coins</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Daily Streak */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Daily Streak</h4>
                  <p className="text-sm text-gray-600">{user.dailyStreak} days</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((user.dailyStreak % 7) * 14.28, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Chat daily to maintain your streak and earn bonus coins!
              </p>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50"
            >
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Live Activity
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">People searching</span>
                  <span className="font-bold text-purple-600">{userCounts.matching}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active chats</span>
                  <span className="font-bold text-green-600">{userCounts.connected}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center Column - Main Action */}
          <div className="space-y-6">
            {/* Main CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <Users className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Ready to Find Your Vibe?
              </h2>
              
              <p className="text-gray-600 mb-6">
                {selectedInterests.length > 0 
                  ? `We'll match you with someone who shares your interests!`
                  : 'Select your interests first to get better matches'
                }
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartMatching}
                disabled={selectedInterests.length === 0}
                className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6" />
                  <span>Start Matching</span>
                </span>
              </motion.button>

              {selectedInterests.length === 0 && (
                <p className="text-sm text-red-500 mt-3">
                  Please select at least one interest to continue
                </p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <button
                onClick={onPremiumUpgrade}
                className="p-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Crown className="w-5 h-5" />
                <span>Go Premium</span>
              </button>
              
              <button
                onClick={onSettingsClick}
                className="p-4 bg-white/80 backdrop-blur-lg border border-gray-200 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column - Interest Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden"
          >
            <InterestSelector
              selectedInterests={selectedInterests}
              onInterestsChange={onInterestsChange}
              onComplete={() => {}}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};