import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (namespace: string = '') => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = `http://localhost:5000${namespace}`;
    socketRef.current = io(url, {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log(`Connected to socket ${url}`);
    });

    socketRef.current.on('disconnect', () => {
      console.log(`Disconnected from socket ${url}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [namespace]);

  return socketRef.current;
};
