export interface Interest {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  trending?: boolean;
}

export const INTEREST_CATEGORIES = [
  'Entertainment',
  'Technology', 
  'Sports',
  'Arts & Culture',
  'Lifestyle',
  'Education',
  'Travel',
  'Gaming'
] as const;

export const INTERESTS: Interest[] = [
  // Entertainment
  { id: 'music', name: 'Music', icon: '🎵', category: 'Entertainment', color: 'from-purple-500 to-pink-500' },
  { id: 'movies', name: 'Movies', icon: '🎬', category: 'Entertainment', color: 'from-red-500 to-orange-500' },
  { id: 'anime', name: 'Anime', icon: '🎌', category: 'Entertainment', color: 'from-pink-500 to-rose-500' },
  { id: 'kpop', name: 'K-Pop', icon: '🎤', category: 'Entertainment', color: 'from-purple-400 to-pink-400' },
  { id: 'streaming', name: 'Streaming', icon: '📺', category: 'Entertainment', color: 'from-blue-500 to-purple-500' },
  
  // Technology
  { id: 'coding', name: 'Coding', icon: '💻', category: 'Technology', color: 'from-green-500 to-blue-500' },
  { id: 'ai', name: 'AI & Tech', icon: '🤖', category: 'Technology', color: 'from-cyan-500 to-blue-500' },
  { id: 'crypto', name: 'Crypto', icon: '₿', category: 'Technology', color: 'from-yellow-500 to-orange-500' },
  
  // Sports
  { id: 'fitness', name: 'Fitness', icon: '💪', category: 'Sports', color: 'from-orange-500 to-red-500' },
  { id: 'football', name: 'Football', icon: '⚽', category: 'Sports', color: 'from-green-600 to-green-400' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', category: 'Sports', color: 'from-orange-600 to-yellow-500' },
  
  // Arts & Culture
  { id: 'art', name: 'Art', icon: '🎨', category: 'Arts & Culture', color: 'from-indigo-500 to-purple-500' },
  { id: 'photography', name: 'Photography', icon: '📸', category: 'Arts & Culture', color: 'from-gray-600 to-gray-400' },
  { id: 'books', name: 'Books', icon: '📚', category: 'Arts & Culture', color: 'from-amber-600 to-yellow-500' },
  
  // Lifestyle
  { id: 'cooking', name: 'Cooking', icon: '👨‍🍳', category: 'Lifestyle', color: 'from-red-500 to-pink-500' },
  { id: 'fashion', name: 'Fashion', icon: '👗', category: 'Lifestyle', color: 'from-pink-500 to-purple-500' },
  { id: 'pets', name: 'Pets', icon: '🐕', category: 'Lifestyle', color: 'from-yellow-500 to-orange-500' },
  
  // Education
  { id: 'science', name: 'Science', icon: '🔬', category: 'Education', color: 'from-blue-600 to-cyan-500' },
  { id: 'languages', name: 'Languages', icon: '🗣️', category: 'Education', color: 'from-green-500 to-teal-500' },
  
  // Travel
  { id: 'travel', name: 'Travel', icon: '✈️', category: 'Travel', color: 'from-sky-500 to-blue-500' },
  { id: 'culture', name: 'Culture', icon: '🌍', category: 'Travel', color: 'from-emerald-500 to-teal-500' },
  
  // Gaming
  { id: 'gaming', name: 'Gaming', icon: '🎮', category: 'Gaming', color: 'from-violet-500 to-purple-500' },
  { id: 'esports', name: 'Esports', icon: '🏆', category: 'Gaming', color: 'from-yellow-500 to-red-500' },
];