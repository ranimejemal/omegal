import React, { useState } from 'react';
import { Crown, X } from 'lucide-react';

interface PremiumModalProps {
  onSubmit: (preferences: { gender: string; nationality: string; country: string }) => void;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  onSubmit,
  onClose,
}) => {
  const [preferences, setPreferences] = useState({
    gender: '',
    nationality: '',
    country: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const genders = ['Any', 'Male', 'Female', 'Other'];
  const nationalities = ['Any', 'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Spanish', 'Italian', 'Japanese', 'Korean', 'Chinese', 'Indian', 'Brazilian', 'Mexican', 'Other'];
  const countries = ['Any', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Japan', 'South Korea', 'China', 'India', 'Brazil', 'Mexico', 'Other'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-900">Premium Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Premium Features:</strong> Choose who you want to chat with based on gender, nationality, and country. Free users are matched randomly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Gender
            </label>
            <select
              value={preferences.gender}
              onChange={(e) => setPreferences(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select gender preference</option>
              {genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Nationality
            </label>
            <select
              value={preferences.nationality}
              onChange={(e) => setPreferences(prev => ({ ...prev, nationality: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select nationality preference</option>
              {nationalities.map(nationality => (
                <option key={nationality} value={nationality}>{nationality}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Country
            </label>
            <select
              value={preferences.country}
              onChange={(e) => setPreferences(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select country preference</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};