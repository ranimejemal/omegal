import React from 'react';
import { Video, X } from 'lucide-react';

interface VideoRequestModalProps {
  onAccept: () => void;
  onReject: () => void;
}

export const VideoRequestModal: React.FC<VideoRequestModalProps> = ({
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Video className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Video Chat Request
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your chat partner would like to start a video chat. Do you want to accept?
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};