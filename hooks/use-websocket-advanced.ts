"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../graphql/types";

interface UseWebSocketOptions {
  conversationId?: string;
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

interface WebSocketState {
  isConnected: boolean;
  lastMessage: Message | null;
  connectionError: string | null;
  reconnectAttempts: number;
}

export const useWebSocketAdvanced = (options: UseWebSocketOptions = {}) => {
  const {
    conversationId,
    autoConnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 1000,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    connectionError: null,
    reconnectAttempts: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const WEBSOCKET_URL =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
    "https://messaging-platform-gfnp.onrender.com";

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    socketRef.current = io(WEBSOCKET_URL, {
      withCredentials: false,
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: false,
      timeout: 20000,
      forceNew: true,
    });

    const socket = socketRef.current;

    if (typeof window !== "undefined") {
      (window as any).socket = socket;
    }

    socket.on("connect", () => {
      reconnectAttemptsRef.current = 0;
      setState((prev) => ({
        ...prev,
        isConnected: true,
        connectionError: null,
        reconnectAttempts: 0,
      }));
    });

    socket.on("disconnect", (reason) => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
      }));

      if (reason === "io server disconnect" || reason === "transport close") {
        handleReconnect();
      }
    });

    socket.on("newMessage", (message: Message) => {
      if (!conversationId || message.conversation?.id === conversationId) {
        setState((prev) => ({
          ...prev,
          lastMessage: message,
        }));
      }
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setState((prev) => ({
        ...prev,
        connectionError: error.message || "Erreur de connexion",
        isConnected: false,
      }));

      handleReconnect();
    });

    socket.connect();
  }, [WEBSOCKET_URL, conversationId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      connectionError: null,
    }));
  }, []);

  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(
        `❌ Échec de reconnexion après ${maxReconnectAttempts} tentatives`
      );
      setState((prev) => ({
        ...prev,
        connectionError: `Impossible de se connecter après ${maxReconnectAttempts} tentatives`,
      }));
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectInterval * reconnectAttemptsRef.current;

    setState((prev) => ({
      ...prev,
      reconnectAttempts: reconnectAttemptsRef.current,
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      connect();
    }, delay);
  }, [connect, maxReconnectAttempts, reconnectInterval]);

  const forceReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Cannot emit: WebSocket not connected");
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected: state.isConnected,
    lastMessage: state.lastMessage,
    connectionError: state.connectionError,
    reconnectAttempts: state.reconnectAttempts,
    connect,
    disconnect,
    forceReconnect,
    emit,
    socketId: socketRef.current?.id,
    isReconnecting: state.reconnectAttempts > 0,
  };
};
