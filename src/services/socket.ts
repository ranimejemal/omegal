import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  // 🌍 Server URL: Use environment variable, otherwise fall back
  private readonly serverUrl =
    import.meta.env.VITE_SERVER_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `https://${window.location.hostname}` // 🔒 HTTPS in production
      : 'http://localhost:3001');

  /**
   * 🔌 Connect to Socket.IO server
   */
  connect(): Socket {
    if (this.socket?.connected) {
      console.log('Already connected to server.');
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,            // 🔁 Enable auto-reconnect
      reconnectionAttempts: 5,       // Max attempts
      reconnectionDelay: 2000,       // Delay between attempts
      secure: this.serverUrl.startsWith('https'),
    });

    this.socket.on('connect', () => {
      console.log(`✅ Connected to server: ${this.socket?.id}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`⚠️ Disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error(`❌ Connection error:`, error.message);
    });

    return this.socket;
  }

  /**
   * 🔌 Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket disconnected.');
    }
  }

  /**
   * 🔍 Get active socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * ✅ Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
