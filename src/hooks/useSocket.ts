import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getBackendSocketUrl } from '@/utils/backendUrl';

const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
  withCredentials: true,
  reconnectionAttempts: 5,
  timeout: 10000,
};

export function useSocket(namespace: string = '') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = getBackendSocketUrl(namespace);
    const client = io(url, SOCKET_OPTIONS);

    const onConnect = () => {
      setConnected(true);
      setError(null);
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err: Error) => {
      setConnected(false);
      setError(err.message);
    };

    client.on('connect', onConnect);
    client.on('disconnect', onDisconnect);
    client.on('connect_error', onConnectError);

    setSocket(client);

    return () => {
      client.off('connect', onConnect);
      client.off('disconnect', onDisconnect);
      client.off('connect_error', onConnectError);
      client.disconnect();
    };
  }, [namespace]);

  return { socket, connected, error };
}

/** @deprecated Use useSocket().socket — kept for minimal migration */
export function useSocketLegacy(namespace: string = '') {
  const { socket } = useSocket(namespace);
  return socket;
}
