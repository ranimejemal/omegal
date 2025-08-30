import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { vibeSocketService } from './services/vibeSocket';
import { useVibeChat } from './hooks/useVibeChat';
import { useVideoChat } from './hooks/useVideoChat';
import { LandingPage } from './components/LandingPage';
import { InterestSelector } from './components/InterestSelector';
import { HomeScreen } from './components/HomeScreen';
import { MatchingScreen } from './components/MatchingScreen';
import { MatchFoundModal } from './components/MatchFoundModal';
import { VibeTextChat } from './components/VibeTextChat';
import { VibeTopBar } from './components/VibeTopBar';
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { VideoRequestModal } from './components/VideoRequestModal';
import { ChatStatus } from './types/chat';
import { User } from './types/user';
import toast from 'react-hot-toast';

type AppState = 'landing' | 'onboarding' | 'home' | 'matching' | 'chat';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [socket, setSocket] = useState(vibeSocketService.getSocket());
  const [user, setUser] = useState<User | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userCounts, setUserCounts] = useState({ matching: 0, connected: 0 });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showVideoRequestModal, setShowVideoRequestModal] = useState(false);
  const [showMatchFoundModal, setShowMatchFoundModal] = useState(false);
  const [pendingMatch, setPendingMatch] = useState(null);

  // Initialize socket and user
  useEffect(() => {
    const socketInstance = vibeSocketService.connect();
    setSocket(socketInstance);

    // Create demo user
    setUser({
      id: socketInstance.id || 'demo-user',
      username: 'VibeUser',
      interests: [],
      vibeScore: 1250,
      vibeCoins: 150,
      isPremium: false,
      dailyStreak: 3,
      totalChats: 47,
      achievements: [],
      isOnline: true
    });

    return () => {
      vibeSocketService.disconnect();
    };
  }, []);

  // Chat and video hooks
  const { 
    status, 
    messages, 
    currentMatch, 
    typingIndicator,
    sendMessage, 
    findPartner, 
    skipPartner,
    endChat 
  } = useVibeChat(socket, user);

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

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleUserCounts = (counts: { matching: number; connected: number }) => {
      setUserCounts(counts);
    };

    const handleVideoRequest = () => {
      setShowVideoRequestModal(true);
    };

    const handleMatchFound = (matchData: any) => {
      setPendingMatch(matchData);
      setShowMatchFoundModal(true);
    };

    socket.on('userCounts', handleUserCounts);
    socket.on('videoRequest', handleVideoRequest);
    socket.on('matchFound', handleMatchFound);

    return () => {
      socket.off('userCounts', handleUserCounts);
      socket.off('videoRequest', handleVideoRequest);
      socket.off('matchFound', handleMatchFound);
    };
  }, [socket]);

  // Handle app state changes based on chat status
  useEffect(() => {
    if (status === ChatStatus.SEARCHING) {
      setAppState('matching');
    } else if (status === ChatStatus.CONNECTED || status === ChatStatus.VIDEO_CALL) {
      setAppState('chat');
      setShowMatchFoundModal(false);
    } else if (status === ChatStatus.DISCONNECTED && appState === 'chat') {
      setAppState('home');
    }
  }, [status, appState]);

  const handleGetStarted = () => {
    setAppState('onboarding');
  };

  const handleOnboardingComplete = () => {
    if (user) {
      user.interests = selectedInterests;
    }
    setAppState('home');
    toast.success('Welcome to VibeMatch! 🎉');
  };

  const handleStartMatching = () => {
    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest first!');
      return;
    }
    findPartner(selectedInterests);
  };

  const handleMatchAction = (type: 'text' | 'video') => {
    setShowMatchFoundModal(false);
    if (type === 'video') {
      startVideoCall();
    }
    setAppState('chat');
  };

  const handleSkipMatch = () => {
    setShowMatchFoundModal(false);
    if (user && user.vibeCoins >= 5) {
      user.vibeCoins -= 5;
      findPartner(selectedInterests);
      toast('Searching for another match...', { icon: '🔄' });
    } else {
      toast.error('Not enough coins to skip!');
      setAppState('home');
    }
  };

  const handlePremiumUpgrade = (tierId: string) => {
    if (user) {
      user.isPremium = true;
      user.premiumTier = tierId as any;
      setShowPremiumModal(false);
      toast.success('Welcome to Premium! ✨');
    }
  };

  const handleBuyCoins = (packageId: string) => {
    // Simulate coin purchase
    if (user) {
      const packages = {
        small: 100,
        medium: 550,
        large: 1200,
        mega: 3250
      };
      user.vibeCoins += packages[packageId as keyof typeof packages] || 100;
      setShowPremiumModal(false);
      toast.success('Coins added to your account! 💰');
    }
  };

  const handleEndChat = () => {
    if (isCallActive) {
      endVideoCall();
    }
    endChat();
  };

  return (
    <div className="min-h-screen">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 16px'
          }
        }}
      />

      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {appState === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <InterestSelector
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
              onComplete={handleOnboardingComplete}
              isOnboarding
            />
          </motion.div>
        )}

        {appState === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <VibeTopBar
              user={user}
              userCounts={userCounts}
              onPremiumUpgrade={() => setShowPremiumModal(true)}
              onProfileClick={() => toast('Profile coming soon!')}
              onSettingsClick={() => toast('Settings coming soon!')}
            />
            <HomeScreen
              user={user!}
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
              onStartMatching={handleStartMatching}
              onPremiumUpgrade={() => setShowPremiumModal(true)}
              onSettingsClick={() => toast('Settings coming soon!')}
              userCounts={userCounts}
            />
          </motion.div>
        )}

        {appState === 'matching' && (
          <motion.div
            key="matching"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <MatchingScreen
              selectedInterests={selectedInterests}
              onCancel={() => {
                endChat();
                setAppState('home');
              }}
            />
          </motion.div>
        )}

        {appState === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-screen flex flex-col"
          >
            <VibeTopBar
              user={user}
              userCounts={userCounts}
              onPremiumUpgrade={() => setShowPremiumModal(true)}
              onProfileClick={() => toast('Profile coming soon!')}
              onSettingsClick={() => toast('Settings coming soon!')}
            />
            <div className="flex-1">
              <VibeTextChat
                messages={messages}
                onSendMessage={sendMessage}
                onVideoRequest={sendVideoRequest}
                onVoiceRequest={() => toast('Voice chat coming soon!')}
                onEndChat={handleEndChat}
                onSkipPartner={skipPartner}
                match={currentMatch}
                isConnected={status === ChatStatus.CONNECTED}
                canRequestVideo={status === ChatStatus.CONNECTED && !isCallActive}
                typingIndicator={typingIndicator}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Overlay */}
      {isCallActive && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl h-96 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
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
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-xl overflow-hidden border-2 border-white shadow-lg">
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
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                  isVideoEnabled 
                    ? 'bg-white/20 backdrop-blur-lg text-white hover:bg-white/30' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <Video className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                  isAudioEnabled 
                    ? 'bg-white/20 backdrop-blur-lg text-white hover:bg-white/30' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <Phone className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={endVideoCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* No remote video message */}
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/75 backdrop-blur-sm">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium">Waiting for partner to join video...</p>
                  <p className="text-gray-300 mt-2">They'll be with you shortly!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showMatchFoundModal && pendingMatch && (
        <MatchFoundModal
          match={pendingMatch}
          onStartChat={handleMatchAction}
          onSkip={handleSkipMatch}
        />
      )}

      {showVideoRequestModal && (
        <VideoRequestModal
          onAccept={() => {
            acceptVideoRequest();
            setShowVideoRequestModal(false);
            startVideoCall();
          }}
          onReject={() => {
            rejectVideoRequest();
            setShowVideoRequestModal(false);
          }}
        />
      )}

      {showPremiumModal && (
        <PremiumUpgradeModal
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handlePremiumUpgrade}
          onBuyCoins={handleBuyCoins}
        />
      )}
    </div>
  );
}

export default App;