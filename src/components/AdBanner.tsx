import React from 'react';

export const AdBanner: React.FC = () => {
  return (
    <div className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 h-16 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-xs font-medium">Advertisement Space</p>
            <p className="text-[10px]">Your ads could be here</p>
          </div>
        </div>
      </div>
    </div>
  );
};
