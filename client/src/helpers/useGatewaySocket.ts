import { useEffect } from 'react';

const WEBSOCKET_PORT = 8080;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;

const listeners = new Set<(data: any) => void>();

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let manuallyClosed = false;

const getSocketUrl = (): string => {
  const hostname = window.location.hostname || 'localhost';
  return `ws://${hostname}:${WEBSOCKET_PORT}`;
};

const scheduleReconnect = () => {
  if (manuallyClosed || reconnectTimer) return;
  const delay = Math.min(
    RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempts,
    RECONNECT_MAX_DELAY_MS
  );
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectAttempts += 1;
    connect();
  }, delay);
};

const disconnectInternal = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.close();
    socket = null;
  }
};

const connect = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    socket = new WebSocket(getSocketUrl());
  } catch (error) {
    console.error('[gateway-socket] Failed to open WebSocket', error);
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    reconnectAttempts = 0;
  };

  socket.onmessage = (event) => {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      return;
    }
    const currentListeners = Array.from(listeners);
    currentListeners.forEach((listener) => listener(data));
  };

  socket.onclose = () => {
    socket = null;
    scheduleReconnect();
  };

  socket.onerror = (error) => {
    console.error('[gateway-socket] WebSocket error', error);
  };
};

const ensureConnected = () => {
  if (manuallyClosed) {
    manuallyClosed = false;
  }
  if (!socket) {
    connect();
  }
};

export const useGatewaySocket = (onEvent?: (data: any) => void) => {
  useEffect(() => {
    if (!onEvent) return;

    ensureConnected();
    const handler = onEvent;
    listeners.add(handler);

    return () => {
      listeners.delete(handler);
    };
  }, [onEvent]);
};

export const closeGatewaySocket = () => {
  manuallyClosed = true;
  reconnectAttempts = 0;
  disconnectInternal();
};
