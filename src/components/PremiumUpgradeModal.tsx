import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, X, Check, Sparkles, Zap } from 'lucide-react';
import { PREMIUM_TIERS, VIBE_COINS_PACKAGES } from '../types/premium';

interface PremiumUpgradeModalProps {
  onClose: () => void;
  onUpgrade: (tierId: string) => void;
  onBuyCoins: (packageId: string) => void;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  onClose,
  onUpgrade,
  onBuyCoins
}) => {
  const [activeTab, setActiveTab] = useState<'premium' | 'coins'>('premium');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Upgrade Your Vibe</h2>
          </div>
          <p className="text-purple-100">Unlock premium features and enhance your chat experience</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'premium'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Crown className="w-5 h-5 inline mr-2" />
            Premium Plans
          </button>
          <button
            onClick={() => setActiveTab('coins')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'coins'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Vibe Coins
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'premium' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PREMIUM_TIERS.map((tier) => (
                <motion.div
                  key={tier.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    tier.popular
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-800">${tier.price}</span>
                      <span className="text-gray-600">/{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => onUpgrade(tier.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    Choose {tier.name}
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'coins' && (
            <div>
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Vibe Coins</h3>
                <p className="text-gray-600">Use coins for premium matches and features</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VIBE_COINS_PACKAGES.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      pkg.popular
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50'
                        : 'border-gray-200 bg-white hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                          <span className="font-bold text-lg">{pkg.coins} Coins</span>
                        </div>
                        {pkg.bonus && (
                          <span className="text-sm text-green-600 font-medium">
                            +{pkg.bonus} bonus!
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">${pkg.price}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => onBuyCoins(pkg.id)}
                      className={`w-full py-2 rounded-xl font-medium transition-all duration-300 ${
                        pkg.popular
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      Buy Now
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">What can you do with coins?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Skip to next partner (5 coins)</li>
                  <li>• Send virtual gifts (10-50 coins)</li>
                  <li>• Boost your profile visibility (20 coins)</li>
                  <li>• Unlock premium filters for 24h (30 coins)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};