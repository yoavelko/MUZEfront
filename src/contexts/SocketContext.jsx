import { createContext, useEffect } from "react";
import { io } from 'socket.io-client'
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {

  const socket = io(import.meta.env.DEV ? 'http://localhost:3001' : import.meta.env.VITE_SOCKET,
    {
      transports: ['websocket'], // Force WebSocket transport
      withCredentials: true,    // Allow cross-origin requests if needed
    }
  );

  useEffect(() => {
    socket.on('connect', () => {
      console.log('socket connection try');
      socket.emit('join-room', 'room-1');
      console.log('socket emit try');
    })
  }, [])
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}