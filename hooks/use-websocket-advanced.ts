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

    console.log("🔌 Connecting to WebSocket:", WEBSOCKET_URL);

    socketRef.current = io(WEBSOCKET_URL, {
      withCredentials: false, // Pour les CORS avec Render.com
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: false, // Gestion manuelle de la reconnexion
      timeout: 20000,
      forceNew: true,
    });

    const socket = socketRef.current;

    // Exposer le socket globalement pour le débogage
    if (typeof window !== "undefined") {
      (window as any).socket = socket;
      console.log("🔍 Socket exposé globalement: window.socket");
    }

    // Événement : Connexion réussie
    socket.on("connect", () => {
      console.log("✅ WebSocket connecté:", socket.id);
      reconnectAttemptsRef.current = 0;
      setState((prev) => ({
        ...prev,
        isConnected: true,
        connectionError: null,
        reconnectAttempts: 0,
      }));
    });

    // Événement : Déconnexion
    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket déconnecté:", reason);
      setState((prev) => ({
        ...prev,
        isConnected: false,
      }));

      // Tentative de reconnexion automatique si nécessaire
      if (reason === "io server disconnect" || reason === "transport close") {
        handleReconnect();
      }
    });

    // Événement : Nouveau message
    socket.on("newMessage", (message: Message) => {
      console.log("📨 Nouveau message reçu:", message);

      // Filtrer par conversation si spécifié
      if (!conversationId || message.conversation?.id === conversationId) {
        setState((prev) => ({
          ...prev,
          lastMessage: message,
        }));
      }
    });

    // Événement : Erreur de connexion
    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion WebSocket:", error);
      setState((prev) => ({
        ...prev,
        connectionError: error.message || "Erreur de connexion",
        isConnected: false,
      }));

      handleReconnect();
    });

    // Connexion immédiate
    socket.connect();
  }, [WEBSOCKET_URL, conversationId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log("🔌 Déconnexion WebSocket manuelle");
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

    console.log(
      `🔄 Tentative de reconnexion ${reconnectAttemptsRef.current}/${maxReconnectAttempts} dans ${delay}ms`
    );

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

  // Émission d'événements personnalisés (si nécessaire)
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("⚠️ Impossible d'émettre, WebSocket non connecté");
    }
  }, []);

  // Hook de connexion automatique
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // État
    isConnected: state.isConnected,
    lastMessage: state.lastMessage,
    connectionError: state.connectionError,
    reconnectAttempts: state.reconnectAttempts,

    // Actions
    connect,
    disconnect,
    forceReconnect,
    emit,

    // Informations
    socketId: socketRef.current?.id,
    isReconnecting: state.reconnectAttempts > 0,
  };
};

// Hook simplifié pour compatibilité avec l'existant
export const useSocket = () => {
  const { isConnected, lastMessage } = useWebSocketAdvanced();
  return { isConnected, lastMessage };
};
