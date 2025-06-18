"use client";

import { useEffect, useState } from "react";

interface SocketIO {
  connect(): void;
  disconnect(): void;
  on(event: string, callback: (data: any) => void): void;
  emit(event: string, data: any): void;
}

const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
  "https://messaging-platform-gfnp.onrender.com";

let socket: SocketIO | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        if (!socket) {
          socket = io(WEBSOCKET_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          }) as any;

          if (socket) {
            socket.on("connect", () => {
              setIsConnected(true);
            });

            socket.on("disconnect", () => {
              setIsConnected(false);
            });

            socket.on("newMessage", (message: any) => {
              setLastMessage(message);
            });

            socket.on("connect_error", (error: any) => {
              console.error("WebSocket connection error:", error);
              setIsConnected(false);
            });
          }
        }
      } catch (error) {
        console.warn(
          "⚠️ Socket.io-client not installed yet. Please run: pnpm install socket.io-client"
        );
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
    };
  }, []);
  const sendMessage = (messageData: any) => {
    if (socket && isConnected) {
      socket.emit("sendMessage", messageData);
    } else {
      console.warn("Cannot send message: WebSocket not connected");
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit("joinConversation", { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit("leaveConversation", { conversationId });
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    joinConversation,
    leaveConversation,
    socket,
  };
};
