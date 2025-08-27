import { useState, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { WebRTCService } from '../services/webrtc';
import { ChatStatus } from '../types/chat';

export const useVideoChat = (socket: Socket | null, chatStatus: ChatStatus) => {
  const [webrtcService] = useState(() => new WebRTCService());
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [pendingVideoRequest, setPendingVideoRequest] = useState(false);

  const startVideoCall = useCallback(async () => {
    if (!socket || chatStatus !== ChatStatus.CONNECTED) return;

    try {
      // Initialize local stream
      const stream = await webrtcService.initializeLocalStream(true, true);
      setLocalStream(stream);

      // Create peer connection
      webrtcService.createPeerConnection();

      // Set up callbacks
      webrtcService.onRemoteStream((stream) => {
        setRemoteStream(stream);
      });

      webrtcService.onIceCandidate((candidate) => {
        socket.emit('iceCandidate', { candidate });
      });

      // Create and send offer
      const offer = await webrtcService.createOffer();
      socket.emit('videoOffer', { offer });

      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  }, [socket, chatStatus, webrtcService]);

  const endVideoCall = useCallback(() => {
    webrtcService.cleanup();
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
  }, [webrtcService]);

  const toggleVideo = useCallback(() => {
    webrtcService.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  }, [webrtcService, isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    webrtcService.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  }, [webrtcService, isAudioEnabled]);

  const sendVideoRequest = useCallback(() => {
    if (!socket || chatStatus !== ChatStatus.CONNECTED) return;
    socket.emit('videoRequest');
    setPendingVideoRequest(true);
  }, [socket, chatStatus]);

  const acceptVideoRequest = useCallback(() => {
    if (!socket) return;
    socket.emit('videoRequestResponse', { accepted: true });
  }, [socket]);

  const rejectVideoRequest = useCallback(() => {
    if (!socket) return;
    socket.emit('videoRequestResponse', { accepted: false });
  }, [socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleVideoOffer = async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
      try {
        // Initialize local stream if not already done
        if (!localStream) {
          const stream = await webrtcService.initializeLocalStream(true, true);
          setLocalStream(stream);
        }

        // Create peer connection
        webrtcService.createPeerConnection();

        // Set up callbacks
        webrtcService.onRemoteStream((stream) => {
          setRemoteStream(stream);
        });

        webrtcService.onIceCandidate((candidate) => {
          socket.emit('iceCandidate', { candidate });
        });

        // Create and send answer
        const answer = await webrtcService.createAnswer(data.offer);
        socket.emit('videoAnswer', { answer });

        setIsCallActive(true);
      } catch (error) {
        console.error('Error handling video offer:', error);
      }
    };

    const handleVideoAnswer = async (data: { answer: RTCSessionDescriptionInit; senderId: string }) => {
      try {
        await webrtcService.handleAnswer(data.answer);
      } catch (error) {
        console.error('Error handling video answer:', error);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; senderId: string }) => {
      try {
        await webrtcService.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const handlePartnerLeft = () => {
      endVideoCall();
      setPendingVideoRequest(false);
    };

    socket.on('videoOffer', handleVideoOffer);
    socket.on('videoAnswer', handleVideoAnswer);
    socket.on('iceCandidate', handleIceCandidate);
    socket.on('partnerLeft', handlePartnerLeft);

    return () => {
      socket.off('videoOffer', handleVideoOffer);
      socket.off('videoAnswer', handleVideoAnswer);
      socket.off('iceCandidate', handleIceCandidate);
      socket.off('partnerLeft', handlePartnerLeft);
    };
  }, [socket, webrtcService, localStream, endVideoCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webrtcService.cleanup();
    };
  }, [webrtcService]);

  return {
    isCallActive,
    isVideoEnabled,
    isAudioEnabled,
    localStream,
      pendingVideoRequest,
    remoteStream,
    startVideoCall,
    endVideoCall,
    toggleVideo,
      sendVideoRequest,
      acceptVideoRequest,
      rejectVideoRequest,
    toggleAudio,
  };
};