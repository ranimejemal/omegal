import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Coins, Users, Settings, User } from 'lucide-react';
import { User as UserType } from '../types/user';

interface VibeTopBarProps {
  user: UserType | null;
  userCounts: { matching: number; connected: number };
  onPremiumUpgrade: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

export const VibeTopBar: React.FC<VibeTopBarProps> = ({
  user,
  userCounts,
  onPremiumUpgrade,
  onProfileClick,
  onSettingsClick
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-purple-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VibeMatch
            </h1>
          </motion.div>

          {/* Center - User Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{userCounts.matching} searching</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{userCounts.connected} chatting</span>
            </div>
          </div>

          {/* Right - User Info & Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Vibe Coins */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-full cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-700">{user.vibeCoins}</span>
                </motion.div>

                {/* Vibe Score */}
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-700">{user.vibeScore}</span>
                </div>

                {/* Premium Badge */}
                {user.isPremium && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1 rounded-full">
                    <Crown className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">
                      {user.premiumTier?.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onProfileClick}
                  className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center hover:from-gray-300 hover:to-gray-400 transition-all duration-200"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </motion.button>
              </>
            )}

            {/* Premium Button */}
            {!user?.isPremium && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPremiumUpgrade}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="w-4 h-4" />
                <span>Go Premium</span>
              </motion.button>
            )}

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettingsClick}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};