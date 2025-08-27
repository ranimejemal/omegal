import React from 'react';
import { Users, Search, MessageSquare, Video } from 'lucide-react';
import { ChatStatus } from '../types/chat';

interface ConnectionStatusProps {
  status: ChatStatus;
  onFindPartner: () => void;
  onStartVideo: () => void;
  onEndChat: () => void;
  isVideoCallActive: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  onFindPartner,
  onStartVideo,
  onEndChat,
  isVideoCallActive,
}) => {
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                status === ChatStatus.CONNECTED || status === ChatStatus.VIDEO_CALL
                  ? 'bg-green-500 animate-pulse'
                  : status === ChatStatus.SEARCHING
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="font-medium text-gray-800 text-center">
              {status === ChatStatus.DISCONNECTED && 'Disconnected'}
              {status === ChatStatus.SEARCHING && 'Searching for partner...'}
              {status === ChatStatus.CONNECTED && 'Connected to partner'}
              {status === ChatStatus.VIDEO_CALL && 'Video chat active'}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {status === ChatStatus.DISCONNECTED && (
              <button
                onClick={onFindPartner}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
              >
                <Users size={20} />
                <span>Find Partner</span>
              </button>
            )}

            {status === ChatStatus.SEARCHING && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md">
                <Search size={20} className="animate-spin" />
                <span>Searching...</span>
              </div>
            )}

            {(status === ChatStatus.CONNECTED || status === ChatStatus.VIDEO_CALL) && (
              <>
                <button
                  onClick={onStartVideo}
                  disabled={isVideoCallActive}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                    isVideoCallActive
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <Video size={20} />
                  <span>{isVideoCallActive ? 'Video Active' : 'Start Video'}</span>
                </button>

                <button
                  onClick={onEndChat}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                >
                  <MessageSquare size={20} />
                  <span>End Chat</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
