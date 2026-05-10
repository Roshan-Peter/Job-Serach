import { Server } from 'socket.io';
import UserService from './UserService.js';

export default class WbService {
  constructor(server, sessionMiddleware) {

    this.io = new Server(server, {
      cors: { origin: '*' },
    });

    this.onlineUsers = new Map();

    /* ---------------- SESSION ---------------- */

    this.io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });

    /* ---------------- CONNECTION ---------------- */

    this.io.on('connection', (socket) => {
      const session = socket.request.session;

      if (!session?.user) {
        console.log('Guest socket connected');
        return;
      }

      const user = session.user;
      const userId = user._id.toString();


      this.onlineUsers.set(userId, socket.id);

      // immediately update count
      this.broadcastActiveCount();

      this.io.emit('user-online', { userId });

      socket.on('activity', () => {
        // console.log(`${user.name} is active`);
      });

      socket.on('disconnect', async () => {
        this.onlineUsers.delete(userId);

        await UserService.updateLastSeen(user._id);

        this.io.emit('user-offline', { userId });

        this.broadcastActiveCount();
      });
    });

    /* ---------------- REAL-TIME COUNT LOOP ---------------- */

    setInterval(() => {
      this.broadcastActiveCount();
    }, 2000);
  }

  /* ---------------- HELPER ---------------- */

  broadcastActiveCount() {
    const count = this.onlineUsers.size;

    this.io.emit('active-user-count', {
      count,
      time: Date.now(),
    });

  }

  isOnline(userId) {
    return this.onlineUsers.has(userId.toString());
  }

  getSocketId(userId) {
    return this.onlineUsers.get(userId.toString());
  }
}