import { createContext, useEffect } from "react";
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {

  const socket = io(import.meta.env.DEV ? 'http://localhost:3001' : import.meta.env.VITE_SOCKET, {
    transports: ['websocket'], // Force WebSocket transport
    withCredentials: true,    // Allow cross-origin requests if needed
  });

  useEffect(() => {
    const handleReconnect = () => {
      console.log('Trying to reconnect...');
      socket.emit('join-room', 'room-1');
    };

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-room', 'room-1');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected, attempting to reconnect...');
      handleReconnect();
    });

    socket.on('reconnect', () => {
      console.log('Reconnected');
      socket.emit('join-room', 'room-1');
    });

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
