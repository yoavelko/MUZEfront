import { createContext, useEffect } from "react";
import { io } from 'socket.io-client'
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = io(import.meta.env.DEV ? 'http://localhost:3001' : import.meta.env.VITE_SOCKET);
  useEffect(() => {
    socket.on('connect', () => {
      socket.emit('join-room', 'room-1')
    })
  }, [])
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}