import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const socket = io(socketUrl, {
  autoConnect: true,
  transports: ['websocket'],
});

export const socketService = {
  connect() {
    if (!socket.connected) socket.connect();
    return socket;
  },
  disconnect() {
    socket.disconnect();
  },
  joinRoom(room) {
    if (room) socket.emit('join:room', room);
  },
  onVehicleAvailability(callback) {
    socket.on('vehicle:availability', callback);
  },
  onBookingUpdated(callback) {
    socket.on('booking:updated', callback);
  },
  offVehicleAvailability(callback) {
    socket.off('vehicle:availability', callback);
  },
  offBookingUpdated(callback) {
    socket.off('booking:updated', callback);
  },
};
