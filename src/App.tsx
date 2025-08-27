import React, { useEffect, useState } from 'react';
import { socketService } from './services/socket';
import { useChat } from './hooks/useChat';
import { useVideoChat } from './hooks/useVideoChat';
import { TopBar } from './components/TopBar';
import { TextChat } from './components/TextChat';
import { VideoRequestModal } from './components/VideoRequestModal';
import { PremiumModal } from './components/PremiumModal';
import { AdBanner } from './components/AdBanner';
import { ChatStatus } from './types/chat';

function App() {
  const [socket, setSocket] = useState(socketService.getSocket());
  const [userCounts, setUserCounts] = useState({ matching: 0, connected: 0 });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showVideoRequestModal, setShowVideoRequestModal] = useState(false);
  const [videoRequestFrom, setVideoRequestFrom] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPreferences, setPremiumPreferences] = useState({
    gender: '',
    nationality: '',
    country: ''
  });

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Chat and video hooks
  const { status, messages, sendMessage, findPartner, endChat } = useChat(socket, premiumPreferences, isPremium);
  const {
    isCallActive,
    isVideoEnabled,
    isAudioEnabled,
    localStream,
    remoteStream,
    startVideoCall,
    endVideoCall,
    toggleVideo,
    toggleAudio,
    sendVideoRequest,
    acceptVideoRequest,
    rejectVideoRequest
  } = useVideoChat(socket, status);

  // Socket event handlers for user counts and video requests
  useEffect(() => {
    if (!socket) return;

    const handleUserCounts = (counts: { matching: number; connected: number }) => {
      setUserCounts(counts);
    };

    const handleVideoRequest = (data: { from: string }) => {
      setVideoRequestFrom(data.from);
      setShowVideoRequestModal(true);
    };

    const handleVideoRequestAccepted = () => {
      setShowVideoRequestModal(false);
      startVideoCall();
    };

    const handleVideoRequestRejected = () => {
      setShowVideoRequestModal(false);
    };

    socket.on('userCounts', handleUserCounts);
    socket.on('videoRequest', handleVideoRequest);
    socket.on('videoRequestAccepted', handleVideoRequestAccepted);
    socket.on('videoRequestRejected', handleVideoRequestRejected);

    return () => {
      socket.off('userCounts', handleUserCounts);
      socket.off('videoRequest', handleVideoRequest);
      socket.off('videoRequestAccepted', handleVideoRequestAccepted);
      socket.off('videoRequestRejected', handleVideoRequestRejected);
    };
  }, [socket, startVideoCall]);

  const handleVideoIconClick = () => {
    if (status === ChatStatus.CONNECTED) {
      sendVideoRequest();
    }
  };

  const handleAcceptVideo = () => {
    acceptVideoRequest();
    setShowVideoRequestModal(false);
  };

  const handleRejectVideo = () => {
    rejectVideoRequest();
    setShowVideoRequestModal(false);
  };

  const handlePremiumUpgrade = () => {
    setShowPremiumModal(true);
  };

  const handlePremiumSubmit = (preferences: typeof premiumPreferences) => {
    setPremiumPreferences(preferences);
    setIsPremium(true);
    setShowPremiumModal(false);
  };

  const handleEndChat = () => {
    if (isCallActive) {
      endVideoCall();
    }
    endChat();
  };

  const isConnected = status === ChatStatus.CONNECTED || status === ChatStatus.VIDEO_CALL;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <TopBar
        userCounts={userCounts}
        onPremiumUpgrade={handlePremiumUpgrade}
        isPremium={isPremium}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Status */}
        <div className="bg-white shadow-sm p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
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
              <span className="font-medium text-gray-800">
                {status === ChatStatus.DISCONNECTED && 'Ready to chat'}
                {status === ChatStatus.SEARCHING && 'Finding someone for you...'}
                {status === ChatStatus.CONNECTED && 'Connected to stranger'}
                {status === ChatStatus.VIDEO_CALL && 'Video chat active'}
              </span>
            </div>

            <div className="flex space-x-2">
              {status === ChatStatus.DISCONNECTED && (
                <button
                  onClick={findPartner}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Start Chat
                </button>
              )}

              {(status === ChatStatus.CONNECTED || status === ChatStatus.VIDEO_CALL) && (
                <button
                  onClick={handleEndChat}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  End Chat
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Text Chat */}
        <div className="flex-1 bg-white overflow-hidden">
          <TextChat
            messages={messages}
            onSendMessage={sendMessage}
            onVideoIconClick={handleVideoIconClick}
            isConnected={isConnected}
            canRequestVideo={status === ChatStatus.CONNECTED && !isCallActive}
          />
        </div>

        {/* Video Chat Overlay */}
        {isCallActive && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full max-w-4xl h-96 bg-gray-900 rounded-lg overflow-hidden">
              {/* Remote video */}
              <video
                ref={(ref) => {
                  if (ref && remoteStream) {
                    ref.srcObject = remoteStream;
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video
                  ref={(ref) => {
                    if (ref && localStream) {
                      ref.srcObject = localStream;
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isVideoEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isVideoEnabled ? '📹' : '📹❌'}
                </button>
                
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isAudioEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isAudioEnabled ? '🎤' : '🎤❌'}
                </button>
                
                <button
                  onClick={endVideoCall}
                  className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                >
                  📞
                </button>
              </div>

              {/* No remote video message */}
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-4">📹</div>
                    <p className="text-lg">Waiting for partner to join video...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ad Banner */}
      <AdBanner />

      {/* Modals */}
      {showVideoRequestModal && (
        <VideoRequestModal
          onAccept={handleAcceptVideo}
          onReject={handleRejectVideo}
        />
      )}

      {showPremiumModal && (
        <PremiumModal
          onSubmit={handlePremiumSubmit}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
}

export default App;