"use client";

import { useState, useEffect } from "react";
import { useWebSocketAdvanced } from "../hooks/use-websocket-advanced";
import { useConversationMessages, useMessaging } from "../hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Wifi, WifiOff, RefreshCw, Send, AlertTriangle } from "lucide-react";

interface AdvancedChatExampleProps {
  conversationId: string;
  userId: string;
}

export function AdvancedChatExample({
  conversationId,
  userId,
}: AdvancedChatExampleProps) {
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<any[]>([]);

  // Hook WebSocket avancé avec filtrage par conversation
  const {
    isConnected,
    lastMessage,
    connectionError,
    reconnectAttempts,
    forceReconnect,
    isReconnecting,
  } = useWebSocketAdvanced({
    conversationId,
    autoConnect: true,
    maxReconnectAttempts: 3,
    reconnectInterval: 2000,
  });

  // Hook pour envoyer des messages via GraphQL
  const { sendMessage } = useMessaging();

  // Hook pour récupérer les messages existants
  const { data: messagesData, loading: messagesLoading } =
    useConversationMessages(conversationId);

  // Synchroniser les messages WebSocket avec l'état local
  useEffect(() => {
    if (lastMessage && lastMessage.conversation?.id === conversationId) {
      setLocalMessages((prev) => {
        // Éviter les doublons
        const exists = prev.some((msg) => msg.id === lastMessage.id);
        if (!exists) {
          return [...prev, lastMessage];
        }
        return prev;
      });
    }
  }, [lastMessage, conversationId]);

  // Charger les messages existants au montage
  useEffect(() => {
    if (messagesData?.conversationMessages) {
      setLocalMessages(messagesData.conversationMessages);
    }
  }, [messagesData]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected) return;

    try {
      // Envoi via GraphQL - la réponse arrivera via WebSocket
      await sendMessage(
        {
          content: message,
          conversationId,
        },
        userId
      );

      setMessage("");
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  const getConnectionBadge = () => {
    if (isConnected) {
      return (
        <Badge variant="default" className="bg-green-500">
          <Wifi className="h-3 w-3 mr-1" />
          En ligne
        </Badge>
      );
    }

    if (isReconnecting) {
      return (
        <Badge variant="secondary">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Reconnexion... ({reconnectAttempts}/3)
        </Badge>
      );
    }

    return (
      <Badge variant="destructive">
        <WifiOff className="h-3 w-3 mr-1" />
        Hors ligne
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Chat Temps Réel - Exemple Avancé
          <div className="flex items-center gap-2">
            {getConnectionBadge()}
            {!isConnected && (
              <Button onClick={forceReconnect} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-1" />
                Reconnecter
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alertes d'erreur */}
        {connectionError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur WebSocket : {connectionError}
            </AlertDescription>
          </Alert>
        )}

        {/* Zone des messages */}
        <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg space-y-2">
          {messagesLoading ? (
            <div className="text-center text-gray-500">
              Chargement des messages...
            </div>
          ) : localMessages.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucun message dans cette conversation
            </div>
          ) : (
            localMessages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${
                  msg.sender?.id === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender?.id === userId
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {msg.sender?.id !== userId && (
                    <div className="text-xs font-medium mb-1">
                      {msg.sender?.username || "Utilisateur"}
                    </div>
                  )}
                  <div>{msg.content}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Zone de saisie */}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              isConnected
                ? "Tapez votre message..."
                : "Connexion WebSocket requise..."
            }
            disabled={!isConnected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Informations de debug */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Conversation ID: {conversationId}</div>
          <div>Messages locaux: {localMessages.length}</div>
          <div>WebSocket: {isConnected ? "Connecté" : "Déconnecté"}</div>
          {reconnectAttempts > 0 && (
            <div>Tentatives de reconnexion: {reconnectAttempts}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
