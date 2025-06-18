//context//socketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

type Presence = {
  userId: string;
  status: string; // e.g. 'Online' | 'In Challenge' | 'Idle'
};

type SocketContextType = {
  socket: Socket | null;
  presenceList: Presence[];
  updateStatus: (status: string) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  presenceList: [],
  updateStatus: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [presenceList, setPresenceList] = useState<Presence[]>([]);

  useEffect(() => {
    if (user && token) {
      const newSocket = io('https://todo-backend-kfpi.onrender.com', {
        transports: ['websocket'],
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('go-online', user.id);
      });

      newSocket.on('presence-update', (list: Presence[]) => {
        setPresenceList(list);
      });

      // Optional: log reconnect attempts
      newSocket.io.on('reconnect_attempt', () => {
        console.log('Socket reconnecting...');
      });

      return () => {
        if (newSocket.connected) {
          newSocket.emit('go-offline', user.id);
          newSocket.disconnect();
        }
        setSocket(null);
        setPresenceList([]);
      };
    }
  }, [user, token]);

  const updateStatus = (status: string) => {
    if (socket && user) {
      socket.emit('status-update', { userId: user.id, status });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, presenceList, updateStatus }}>
      {children}
    </SocketContext.Provider>
  );
};
