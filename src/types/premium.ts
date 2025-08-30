export interface PremiumTier {
  id: 'basic' | 'pro' | 'vip';
  name: string;
  price: number;
  period: 'month' | 'lifetime';
  features: string[];
  color: string;
  popular?: boolean;
}

export const PREMIUM_TIERS: PremiumTier[] = [
  {
    id: 'basic',
    name: 'Basic Premium',
    price: 4.99,
    period: 'month',
    features: [
      'Unlimited matches',
      'Faster partner finding',
      'Basic filters (age, country)',
      'No ads',
      'Priority support'
    ],
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'pro',
    name: 'Pro Premium',
    price: 9.99,
    period: 'month',
    features: [
      'Everything in Basic',
      'Advanced filters (language, interests)',
      'Custom profile themes',
      'Vibe Radar feature',
      'Chat history backup',
      'Exclusive badges'
    ],
    color: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    id: 'vip',
    name: 'Lifetime VIP',
    price: 99.99,
    period: 'lifetime',
    features: [
      'Everything in Pro',
      'Lifetime access',
      'VIP badge',
      'Early access to features',
      'Custom emoji reactions',
      'Priority matching'
    ],
    color: 'from-yellow-500 to-orange-500'
  }
];

export interface VibeCoinsPackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

export const VIBE_COINS_PACKAGES: VibeCoinsPackage[] = [
  { id: 'small', coins: 100, price: 0.99 },
  { id: 'medium', coins: 500, price: 3.99, bonus: 50 },
  { id: 'large', coins: 1000, price: 6.99, bonus: 200, popular: true },
  { id: 'mega', coins: 2500, price: 14.99, bonus: 750 }
];