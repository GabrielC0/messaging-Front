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
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { useWebSocketAdvanced } from "../hooks/use-websocket-advanced";
import { useNotifications } from "../hooks/use-notifications";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Activity,
  AlertTriangle,
  Bell,
  BellOff,
} from "lucide-react";

export function WebSocketTestPanel() {
  const [testConversationId, setTestConversationId] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);

  // Hook WebSocket
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
  }); // Hook Notifications
  const {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showMessageNotification,
    showTestNotification,
    isSupported,
  } = useNotifications();

  // Écouter les nouveaux messages
  useEffect(() => {
    if (lastMessage) {
      console.log("📨 Nouveau message reçu:", lastMessage);
      console.log("🔔 État notifications:", {
        permission,
        enabled: settings.enabled,
        isSupported,
      });

      setReceivedMessages((prev) => [...prev.slice(-9), lastMessage]); // Garder les 10 derniers messages

      // TOUJOURS déclencher une notification pour tout message reçu (pour test)
      if (isSupported && permission === "granted" && settings.enabled) {
        console.log("✅ Conditions remplies - affichage notification");

        // Essayer de détecter le type de message et adapter
        if (lastMessage.content && lastMessage.sender) {
          // Message structuré (type Message)
          console.log("📧 Message structuré détecté");
          showMessageNotification({
            sender:
              lastMessage.sender.username ||
              lastMessage.sender.email ||
              "Utilisateur",
            content: lastMessage.content,
            conversationId: lastMessage.conversation?.id || testConversationId,
          });
        } else {
          // Message WebSocket brut ou événement
          console.log("� Événement WebSocket détecté");
          showMessageNotification({
            sender: "WebSocket Event",
            content: `Événement reçu: ${JSON.stringify(lastMessage).substring(
              0,
              100
            )}...`,
            conversationId: testConversationId || "websocket-test",
          });
        }
      } else {
        console.warn("❌ Conditions non remplies pour notification:", {
          isSupported,
          permission,
          enabled: settings.enabled,
        }); // Si la permission est 'default', proposer de l'activer automatiquement
        if (permission === "default" && isSupported) {
          console.log(
            "💡 Permission 'default' détectée - suggestion d'activation automatique"
          );

          // Message très visible pour guider l'utilisateur
          console.log("\n" + "🔔".repeat(50));
          console.log(
            "%c🚨 NOTIFICATION BLOQUÉE - ACTION REQUISE 🚨",
            "background: #ff6b35; color: white; padding: 10px; font-size: 16px; font-weight: bold; border-radius: 5px;"
          );
          console.log(
            '%c➡️ SOLUTION: Scrollez vers le bas et cliquez sur le bouton orange "👆 Activer"',
            "background: #ffa500; color: white; padding: 8px; font-size: 14px; border-radius: 3px;"
          );
          console.log(
            '%c📍 EMPLACEMENT: Section "Système de Notifications" → Bouton "👆 Activer"',
            "background: #4CAF50; color: white; padding: 6px; font-size: 12px; border-radius: 3px;"
          );
          console.log("🔔".repeat(50) + "\n");
        }
      }
    }
  }, [
    lastMessage,
    showMessageNotification,
    settings.enabled,
    permission,
    testConversationId,
    isSupported,
  ]);

  // Nouvelles fonctions utilitaires pour le débogage
  const testWebSocketFeatures = () => {
    if (!isConnected) {
      console.warn("⚠️ WebSocket non connecté");
      return;
    }

    console.group("🧪 Test des fonctionnalités WebSocket");

    // Test 1: Ping simple
    console.log("1. Test Ping...");
    emit("ping", { timestamp: Date.now(), source: "test-panel" });

    // Test 2: Test avec conversation ID
    if (testConversationId) {
      console.log("2. Test avec Conversation ID:", testConversationId);
      emit("joinConversation", { conversationId: testConversationId });
    }

    // Test 3: Émission d'événement personnalisé
    console.log("3. Test événement personnalisé...");
    emit("testEvent", {
      type: "diagnostic",
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    console.groupEnd();
  };

  const exportDiagnostics = () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      websocket: {
        isConnected,
        socketId,
        connectionError,
        reconnectAttempts,
        isReconnecting,
        url: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
      },
      browser: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: Object.keys(localStorage),
        debugEnabled: localStorage.getItem("debug"),
      },
      messages: {
        received: receivedMessages.length,
        lastMessage: receivedMessages[receivedMessages.length - 1],
        conversationFilter: testConversationId,
      },
    };

    console.log("📋 Diagnostics WebSocket:", diagnostics);

    // Copier dans le presse-papiers
    navigator.clipboard
      .writeText(JSON.stringify(diagnostics, null, 2))
      .then(() => console.log("✅ Diagnostics copiés dans le presse-papiers"))
      .catch(() =>
        console.warn("⚠️ Impossible de copier dans le presse-papiers")
      );
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
      {/* Banner d'alerte pour permission non accordée */}
      {permission === "default" && isSupported && (
        <Alert className="border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="animate-bounce">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-orange-800 text-lg mb-2">
                🚨 Notifications désactivées - Action requise
              </div>
              <div className="text-orange-700 mb-3">
                Pour recevoir des notifications lors de nouveaux messages
                WebSocket, vous devez autoriser les notifications de ce site.
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={requestPermission}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold animate-pulse shadow-lg"
                  size="lg"
                >
                  🔔 AUTORISER LES NOTIFICATIONS
                </Button>
                <div className="text-sm text-orange-600">
                  ← Cliquez ici puis "Autoriser" dans la popup du navigateur
                </div>
              </div>
            </div>
          </div>
        </Alert>
      )}

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
          </div>{" "}
        </CardContent>
      </Card>

      {/* Section Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permission === "granted" ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            Système de Notifications
          </CardTitle>
          <CardDescription>
            Configurer et tester les notifications pour les nouveaux messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {" "}
          {/* Statut des permissions */}
          <div
            className={`flex items-center justify-between p-4 border rounded-lg ${
              permission === "default"
                ? "border-yellow-300 bg-yellow-50"
                : permission === "denied"
                ? "border-red-300 bg-red-50"
                : "border-green-300 bg-green-50"
            }`}
          >
            <div>
              <div className="font-medium">Permission du navigateur</div>
              <div className="text-sm text-muted-foreground">
                {permission === "granted" &&
                  "✅ Les notifications sont autorisées"}
                {permission === "denied" &&
                  "❌ Les notifications sont bloquées - Réinitialisez dans les paramètres du navigateur"}
                {permission === "default" &&
                  "⚠️ Cliquez sur 'Activer' pour autoriser les notifications"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={permission === "granted" ? "default" : "destructive"}
              >
                {permission === "granted"
                  ? "Autorisées"
                  : permission === "default"
                  ? "À activer"
                  : "Bloquées"}
              </Badge>
              {permission !== "granted" && (
                <Button
                  onClick={requestPermission}
                  size="sm"
                  className={
                    permission === "default"
                      ? "animate-pulse bg-yellow-500 hover:bg-yellow-600"
                      : ""
                  }
                >
                  {permission === "default" ? "👆 Activer" : "Réessayer"}
                </Button>
              )}
            </div>
          </div>
          {/* Alerte pour permission default */}
          {permission === "default" && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Action requise :</strong> Cliquez sur le bouton "👆
                Activer" ci-dessus pour autoriser les notifications. Une popup
                du navigateur va apparaître - cliquez sur "Autoriser".
              </AlertDescription>
            </Alert>
          )}
          {/* Paramètres rapides */}
          {isSupported && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notifications activées</div>
                  <div className="text-sm text-muted-foreground">
                    Recevoir des notifications pour les nouveaux messages
                  </div>
                </div>
                <Button
                  variant={settings.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  disabled={permission !== "granted"}
                >
                  {settings.enabled ? "ON" : "OFF"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Son de notification</div>
                  <div className="text-sm text-muted-foreground">
                    Jouer un son lors de la réception
                  </div>
                </div>
                <Button
                  variant={settings.sound ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings({ sound: !settings.sound })}
                  disabled={!settings.enabled || permission !== "granted"}
                >
                  {settings.sound ? "ON" : "OFF"}
                </Button>
              </div>
            </div>
          )}{" "}
          {/* Test de notification */}
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">Test de notification</h4>

            {permission !== "granted" && (
              <Alert className="border-orange-300 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Tests désactivés :</strong> Vous devez d'abord
                  autoriser les notifications en cliquant sur "👆 Activer"
                  ci-dessus.
                </AlertDescription>
              </Alert>
            )}

            {/* Test immédiat avec notification native */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log("🧪 Test notification native directe...");
                  if (isSupported && permission === "granted") {
                    try {
                      const notification = new Notification(
                        "🧪 Test WebSocket",
                        {
                          body: "Notification de test directe du navigateur",
                          icon: "/placeholder-logo.png",
                          tag: "test-direct",
                        }
                      );
                      notification.onclick = () => {
                        console.log("🔔 Clic sur notification test");
                        notification.close();
                      };
                      setTimeout(() => notification.close(), 5000);
                      console.log("✅ Notification directe envoyée");
                    } catch (error) {
                      console.error("❌ Erreur notification directe:", error);
                    }
                  } else {
                    console.warn("❌ Conditions non remplies:", {
                      isSupported,
                      permission,
                    });
                  }
                }}
                disabled={permission !== "granted"}
                variant="outline"
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Direct (Navigateur)
              </Button>

              <Button
                onClick={() => {
                  console.log("🧪 Test via service...");
                  showTestNotification();
                }}
                disabled={permission !== "granted" || !settings.enabled}
                variant="outline"
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Service
              </Button>
            </div>

            <div className="flex gap-2">
              {" "}
              <Button
                onClick={() => {
                  console.log("📨 Test notification message...");
                  if (permission === "granted" && settings.enabled) {
                    showMessageNotification(
                      {
                        sender: "Test User",
                        content:
                          "Ceci est un message de test pour vérifier les notifications !",
                        conversationId:
                          testConversationId || "test-conversation",
                      },
                      { forceShow: true }
                    ); // Force l'affichage pour les tests
                  }
                }}
                disabled={permission !== "granted" || !settings.enabled}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Test Message
              </Button>
              <Button
                onClick={() => {
                  console.log("🚀 Simulation réception WebSocket...");
                  // Simuler un message WebSocket pour tester la chaîne complète
                  const fakeMessage = {
                    id: "test-" + Date.now(),
                    content: "Message de test simulé",
                    sender: {
                      id: "test-user",
                      username: "TestUser",
                      email: "test@example.com",
                    },
                    conversation: {
                      id: testConversationId || "test-conv",
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isRead: false,
                  };

                  // Ajouter à la liste des messages reçus
                  setReceivedMessages((prev) => [
                    ...prev.slice(-9),
                    fakeMessage,
                  ]);
                  // Déclencher notification manuellement
                  if (permission === "granted" && settings.enabled) {
                    showMessageNotification(
                      {
                        sender: fakeMessage.sender.username,
                        content: fakeMessage.content,
                        conversationId: fakeMessage.conversation.id,
                      },
                      { forceShow: true }
                    ); // Force pour simulation
                  }
                }}
                variant="secondary"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Simuler WebSocket
              </Button>
            </div>
          </div>
          {/* Statut et informations */}
          <div className="bg-muted p-3 rounded-lg text-sm">
            <div className="font-medium mb-2">
              ℹ️ Informations sur les notifications
            </div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                • <strong>Support navigateur:</strong>{" "}
                {isSupported ? "✅ Supporté" : "❌ Non supporté"}
              </li>
              <li>
                • <strong>Permission:</strong> {permission}
              </li>
              <li>
                • <strong>Notifications actives:</strong>{" "}
                {settings.enabled ? "✅ Oui" : "❌ Non"}
              </li>
              <li>
                • <strong>Son activé:</strong>{" "}
                {settings.sound ? "✅ Oui" : "❌ Non"}
              </li>
              <li>
                • <strong>Affichage aperçu:</strong>{" "}
                {settings.showPreview ? "✅ Oui" : "❌ Non"}
              </li>
            </ul>
          </div>
          {/* Instructions si pas de support */}
          {!isSupported && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Votre navigateur ne supporte pas les notifications natives.
                Essayez avec Chrome, Firefox, ou Edge récent.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      {/* Informations de débogage */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de Débogage</CardTitle>
          <CardDescription>
            Informations techniques et outils de débogage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div>
              <strong>URL :</strong>{" "}
              {process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
                "https://messaging-platform-gfnp.onrender.com"}
            </div>
            <div>
              <strong>Transports :</strong> websocket, polling
            </div>
          </div>

          <Separator className="my-4" />

          {/* Section de débogage améliorée */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Logs Socket.IO</p>
                <p className="text-xs text-muted-foreground">
                  Activez les logs détaillés pour le débogage
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // Activer les logs Socket.IO (nouvelle syntaxe)
                    localStorage.setItem("debug", "socket.io-client:*");
                    window.location.reload();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Activer Logs
                </Button>
                <Button
                  onClick={() => {
                    // Désactiver les logs
                    localStorage.removeItem("debug");
                    window.location.reload();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Désactiver
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Console Browser</p>
                <p className="text-xs text-muted-foreground">
                  Outils de débogage navigateur
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    console.log("🔍 État WebSocket:", {
                      isConnected,
                      socketId,
                      connectionError,
                      reconnectAttempts,
                      isReconnecting,
                      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
                    });
                    console.log("📊 Messages reçus:", receivedMessages);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Log État
                </Button>
                <Button
                  onClick={() => {
                    // Test de connexion manuelle
                    console.log("🧪 Test de connexion WebSocket...");
                    emit("ping", { timestamp: Date.now(), test: true });
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!isConnected}
                >
                  Test Ping
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tests Avancés</p>
                <p className="text-xs text-muted-foreground">
                  Outils de test et diagnostic
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={testWebSocketFeatures}
                  variant="outline"
                  size="sm"
                  disabled={!isConnected}
                >
                  Test Complet
                </Button>
                <Button onClick={exportDiagnostics} variant="outline" size="sm">
                  Export Diagnostics
                </Button>
                <Button
                  onClick={() => {
                    console.clear();
                    console.log("🧹 Console nettoyée");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear Console
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg text-xs">
              <p className="font-medium mb-2">
                🔧 Commandes Console Manuelles:
              </p>
              <div className="space-y-1 font-mono">
                <p>
                  <code>localStorage.debug = 'socket.io-client:*'</code> - Logs
                  complets
                </p>
                <p>
                  <code>localStorage.debug = 'socket.io-client:socket'</code> -
                  Logs socket uniquement
                </p>
                <p>
                  <code>console.log(window.socket)</code> - Inspecter l'objet
                  socket
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Section d'aide et documentation */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Guide de Débogage WebSocket</CardTitle>
          <CardDescription>
            Instructions pour diagnostiquer les problèmes de connexion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🚀 Démarrage rapide</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Vérifiez que l'état de connexion est "Connecté"</li>
                <li>Cliquez sur "Activer Logs" pour voir les détails</li>
                <li>
                  Utilisez "Test Complet" pour valider les fonctionnalités
                </li>
                <li>Consultez la console du navigateur (F12)</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">🐛 Résolution de problèmes</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>
                  <strong>Déconnexions fréquentes:</strong> Vérifiez votre
                  connexion réseau
                </li>
                <li>
                  <strong>Messages non reçus:</strong> Testez avec un ID de
                  conversation
                </li>
                <li>
                  <strong>Logs vides:</strong> Actualisez la page après
                  activation
                </li>
                <li>
                  <strong>Erreurs CORS:</strong> Le backend gère automatiquement
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">💡 Conseils avancés</h4>
            <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
              <p>
                <strong>Console Commands:</strong>
              </p>{" "}
              <div className="font-mono text-xs space-y-1">
                <p>
                  <code>window.socket</code> - Accéder à l'objet socket
                </p>
                <p>
                  <code>
                    window.socket.emit(&apos;ping&apos;, &#123;test: true&#125;)
                  </code>{" "}
                  - Envoyer un ping manuel
                </p>
                <p>
                  <code>
                    localStorage.debug = &apos;socket.io-client:*&apos;
                  </code>{" "}
                  - Activer tous les logs
                </p>
                <p>
                  <code>window.socket.connected</code> - Vérifier l'état de
                  connexion
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
