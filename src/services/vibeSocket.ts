import { io, Socket } from 'socket.io-client';

class VibeSocketService {
  private socket: Socket | null = null;

  private readonly serverUrl =
    import.meta.env.VITE_SERVER_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `https://${window.location.hostname}` 
      : 'http://localhost:3001');

  connect(): Socket {
    if (this.socket?.connected) {
      console.log('Already connected to VibeMatch server.');
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      secure: this.serverUrl.startsWith('https'),
    });

    this.socket.on('connect', () => {
      console.log(`✨ Connected to VibeMatch server: ${this.socket?.id}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`⚠️ Disconnected from VibeMatch: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error(`❌ VibeMatch connection error:`, error.message);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 VibeMatch socket disconnected.');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const vibeSocketService = new VibeSocketService();