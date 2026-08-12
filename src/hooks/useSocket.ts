import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getBackendSocketUrl } from '@/utils/backendUrl';
import { BASE_SOCKET_OPTIONS, getSocketAuthToken } from '@/utils/socketAuth';

export function useSocket(namespace: string = '') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let client: Socket | null = null;
    let cancelled = false;

    async function connect() {
      const token = await getSocketAuthToken();
      if (cancelled) return;

      if (!token) {
        setError('Sign in required for real-time features');
        setConnected(false);
        setSocket(null);
        return;
      }

      const url = getBackendSocketUrl(namespace);
      client = io(url, {
        ...BASE_SOCKET_OPTIONS,
        auth: { token },
      });

      const onConnect = () => {
        setConnected(true);
        setError(null);
      };
      const onDisconnect = () => setConnected(false);
      const onConnectError = (err: Error) => {
        setConnected(false);
        setError(err.message.includes('Unauthorized') ? 'Authentication failed' : err.message);
      };

      client.on('connect', onConnect);
      client.on('disconnect', onDisconnect);
      client.on('connect_error', onConnectError);

      if (!cancelled) setSocket(client);
    }

    connect();

    return () => {
      cancelled = true;
      client?.disconnect();
    };
  }, [namespace]);

  return { socket, connected, error };
}

/** @deprecated Use useSocket().socket — kept for minimal migration */
export function useSocketLegacy(namespace: string = '') {
  const { socket } = useSocket(namespace);
  return socket;
}
