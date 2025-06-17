"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { useWebSocketAdvanced } from "../hooks/use-websocket-advanced";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function WebSocketTestPanel() {
  const [testConversationId, setTestConversationId] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);

  const {
    isConnected,
    lastMessage,
    connectionError,
    reconnectAttempts,
    connect,
    disconnect,
    forceReconnect,
    emit,
    socketId,
    isReconnecting,
  } = useWebSocketAdvanced({
    conversationId: testConversationId || undefined,
    autoConnect: true,
    maxReconnectAttempts: 5,
    reconnectInterval: 2000,
  });
  // Écouter les nouveaux messages
  useEffect(() => {
    if (lastMessage) {
      setReceivedMessages((prev) => [...prev.slice(-9), lastMessage]); // Garder les 10 derniers messages
    }
  }, [lastMessage]);

  const handleTestEmit = () => {
    if (testMessage.trim()) {
      emit("testMessage", {
        content: testMessage,
        timestamp: new Date().toISOString(),
      });
      setTestMessage("");
    }
  };

  const clearMessages = () => {
    setReceivedMessages([]);
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        variant: "default" as const,
        icon: <Wifi className="h-4 w-4" />,
        text: "Connecté",
        color: "text-green-600",
      };
    }

    if (isReconnecting) {
      return {
        variant: "secondary" as const,
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        text: `Reconnexion (${reconnectAttempts}/5)`,
        color: "text-yellow-600",
      };
    }

    return {
      variant: "destructive" as const,
      icon: <WifiOff className="h-4 w-4" />,
      text: "Déconnecté",
      color: "text-red-600",
    };
  };

  const status = getConnectionStatus();

  return (
    <div className="space-y-6">
      {/* État de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            État de la Connexion WebSocket
          </CardTitle>
          <CardDescription>
            Test et monitoring de la connexion en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={status.variant}
                className="flex items-center gap-1"
              >
                {status.icon}
                {status.text}
              </Badge>
              {socketId && (
                <span className="text-sm text-muted-foreground">
                  ID: {socketId}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={isConnected ? disconnect : connect}
                variant={isConnected ? "destructive" : "default"}
                size="sm"
              >
                {isConnected ? "Déconnecter" : "Connecter"}
              </Button>
              <Button onClick={forceReconnect} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Forcer Reconnexion
              </Button>
            </div>
          </div>

          {connectionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erreur de connexion : {connectionError}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>URL WebSocket :</strong>
              <div className="text-muted-foreground break-all">
                {process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
                  "https://messaging-platform-gfnp.onrender.com"}
              </div>
            </div>
            <div>
              <strong>Tentatives de reconnexion :</strong>
              <div className="text-muted-foreground">{reconnectAttempts}/5</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test de filtrage par conversation */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrage par Conversation</CardTitle>
          <CardDescription>
            Testez le filtrage des messages par conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ID de conversation (optionnel)"
              value={testConversationId}
              onChange={(e) => setTestConversationId(e.target.value)}
            />
            <Button onClick={() => setTestConversationId("")} variant="outline">
              Réinitialiser
            </Button>
          </div>
          {testConversationId && (
            <div className="p-2 bg-blue-50 rounded text-sm">
              <strong>Filtre actif :</strong> {testConversationId}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test d'émission */}
      <Card>
        <CardHeader>
          <CardTitle>Test d'Émission</CardTitle>
          <CardDescription>
            Testez l'envoi d'événements via WebSocket
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Message de test..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleTestEmit()}
              disabled={!isConnected}
            />
            <Button
              onClick={handleTestEmit}
              disabled={!isConnected || !testMessage.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Envoyer
            </Button>
          </div>
          {!isConnected && (
            <p className="text-sm text-muted-foreground">
              Connectez-vous au WebSocket pour tester l'émission
            </p>
          )}
        </CardContent>
      </Card>

      {/* Messages reçus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Messages Reçus en Temps Réel
            <div className="flex gap-2">
              <Badge variant="outline">
                {receivedMessages.length} message(s)
              </Badge>
              <Button onClick={clearMessages} variant="outline" size="sm">
                Effacer
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Messages reçus via l'événement "newMessage"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {receivedMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Aucun message reçu</p>
              <p className="text-sm">
                {isConnected
                  ? "En attente de nouveaux messages..."
                  : "Connectez-vous pour recevoir des messages"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {receivedMessages.map((message, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {message.sender?.username || "Utilisateur Inconnu"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        message.createdAt || Date.now()
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  {message.conversation?.id && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Conversation: {message.conversation.id}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations de débogage */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de Débogage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <strong>État Connexion :</strong> {isConnected ? "true" : "false"}
            </div>
            <div>
              <strong>Socket ID :</strong> {socketId || "Non connecté"}
            </div>
            <div>
              <strong>En Reconnexion :</strong>{" "}
              {isReconnecting ? "true" : "false"}
            </div>
            <div>
              <strong>Erreur :</strong> {connectionError || "Aucune"}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Debug Console :</strong> Ouvrez la console pour voir les
              logs détaillés
            </p>
            <p>
              <strong>Logs Socket.IO :</strong> Exécutez `localStorage.debug =
              'socket.io-client:socket'` dans la console
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
