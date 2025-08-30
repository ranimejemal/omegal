export interface User {
  id: string;
  username?: string;
  avatar?: string;
  interests: string[];
  vibeScore: number;
  vibeCoins: number;
  isPremium: boolean;
  premiumTier?: 'basic' | 'pro' | 'vip';
  dailyStreak: number;
  totalChats: number;
  achievements: string[];
  theme?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface UserPreferences {
  ageRange?: [number, number];
  country?: string;
  language?: string;
  gender?: string;
}

export interface MatchResult {
  partnerId: string;
  sharedInterests: string[];
  matchScore: number;
  partnerUsername?: string;
  partnerAvatar?: string;
}