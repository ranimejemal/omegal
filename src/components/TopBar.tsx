import React from 'react';
import { Users, Crown } from 'lucide-react';

interface TopBarProps {
  userCounts: { matching: number; connected: number };
  onPremiumUpgrade: () => void;
  isPremium: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  userCounts,
  onPremiumUpgrade,
  isPremium,
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Omegal</h1>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <a
                href="#about"
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                About Us
              </a>
              <a
                href="#history"
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                History
              </a>
            </nav>
          </div>

          {/* Right side - User counts and buttons */}
          <div className="flex items-center space-x-6">
            {/* User counts */}
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users size={16} />
                <span>{userCounts.matching} matching</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{userCounts.connected} connected</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                Sign In
              </button>
              
              <button
                onClick={onPremiumUpgrade}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isPremium
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                <Crown size={16} />
                <span>{isPremium ? 'Premium' : 'Go Premium'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};