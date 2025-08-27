export interface Message {
  id: string;
  message: string;
  timestamp: string;
  senderId: string;
  isOwn?: boolean;
}

export interface User {
  id: string;
  isConnected: boolean;
}

export interface ChatRoom {
  id: string;
  partner?: User;
  messages: Message[];
}

export enum ChatStatus {
  DISCONNECTED = 'disconnected',
  SEARCHING = 'searching', 
  CONNECTED = 'connected',
  VIDEO_CALL = 'video_call'
}

export interface VideoCallState {
  isCallActive: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}