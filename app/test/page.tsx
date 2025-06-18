"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  Database,
  MessageSquare,
  Bell,
  BellOff,
  Bug,
} from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useNotifications } from "@/hooks/use-notifications";
import { useGlobalNotifications } from "@/hooks/use-global-notifications";
import {
  diagnoseWebSockets,
  cleanupWebSockets,
  logWebSocketDiagnostic,
  testWebSocketHealth,
} from "@/lib/websocket-debug";

export default function TestPage() {
  const [testResults, setTestResults] = useState<{
    [key: string]: "success" | "error" | "warning" | null;
  }>({});
  const { isConnected, isInitialized, socket, testConnection, forceReconnect } =
    useSocket();
  const {
    requestPermission,
    permission,
    isReady,
    showTestNotification,
    testNotificationSound,
  } = useNotifications();
  const { isListening, systemStatus } = useGlobalNotifications();

  const runTest = (
    testName: string,
    testFn: () => boolean | Promise<boolean>
  ) => {
    const executeTest = async () => {
      try {
        const result = await testFn();
        setTestResults((prev) => ({
          ...prev,
          [testName]: result ? "success" : "error",
        }));
      } catch (error) {
        setTestResults((prev) => ({ ...prev, [testName]: "error" }));
        console.error(`Test ${testName} failed:`, error);
      }
    };
    executeTest();
  };
  const testWebSocket = async (): Promise<boolean> => {
    return (await testConnection()) as boolean;
  };
  const testNotifications = async () => {
    if (permission === "default") {
      await requestPermission();
    }
    if (permission === "granted") {
      showTestNotification();
      return true;
    }
    return false;
  };
  const testSystemComplete = async () => {
    const results = {
      websocket: await testWebSocket(),
      notifications: await testNotifications(),
      sound: testSound(),
      api: await testAPI(),
    };

    const allWorking = Object.values(results).every((r) => r);

    setTestResults((prev) => ({
      ...prev,
      websocket: results.websocket ? "success" : "error",
      notifications: results.notifications ? "success" : "error",
      sound: results.sound ? "success" : "error",
      api: results.api ? "success" : "error",
      systemComplete: allWorking ? "success" : "error",
    }));

    return allWorking;
  };
  const forceResetSystem = () => {
    setTestResults({});

    if (forceReconnect) {
      forceReconnect();
    }

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const testSound = () => {
    testNotificationSound();
    return true;
  };
  const testAPI = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        return data.frontend === "healthy";
      }
      return false;
    } catch (error) {
      console.error("API test failed:", error);
      return false;
    }
  };

  const getStatusIcon = (status: "success" | "error" | "warning" | null) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: "success" | "error" | "warning" | null) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            OK
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">ERREUR</Badge>;
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            ATTENTION
          </Badge>
        );
      default:
        return <Badge variant="outline">NON TESTÉ</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page de Test</h1>
        <p className="text-gray-600">Tests de fonctionnalité du système</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WebSocket</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(testResults.websocket)}
              <span className="text-sm">
                Status: {isConnected ? "Connecté" : "Déconnecté"}
                {!isInitialized && " (Non initialisé)"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                {getStatusBadge(testResults.websocket)}
                <Button
                  size="sm"
                  onClick={() => runTest("websocket", testWebSocket)}
                >
                  Tester
                </Button>
              </div>{" "}
              {!isConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    forceReconnect();
                  }}
                  className="w-full"
                >
                  🔄 Reconnexion forcée
                </Button>
              )}{" "}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const debugInfo = {
                    // État du hook
                    hookState: {
                      isConnected,
                      isInitialized,
                    },
                    // État réel du socket
                    socketState: {
                      exists: !!socket,
                      id: (socket as any)?.id,
                      connected: (socket as any)?.connected,
                      disconnected: (socket as any)?.disconnected,
                      readyState: (socket as any)?.readyState,
                      url: (socket as any)?.io?.uri,
                    },
                    // Comparaison
                    comparison: {
                      stateVsReality:
                        isConnected === (socket as any)?.connected,
                      hasDiscrepancy:
                        isConnected !== (socket as any)?.connected,
                    },
                    // Environment
                    environment: {
                      websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
                      timestamp: new Date().toISOString(),
                    },
                  };
                  console.log("🔍 Debug WebSocket complet:", debugInfo);
                  alert(
                    `Debug WebSocket:\n${JSON.stringify(debugInfo, null, 2)}`
                  );
                }}
                className="w-full text-xs"
              >
                🔍 Debug WebSocket Avancé
              </Button>
            </div>
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {" "}
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(testResults.notifications)}
              <span className="text-sm">
                Permission: {permission}
                {!isReady && " (Non prêt)"}
                {!isListening && " (Pas d'écoute)"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                {getStatusBadge(testResults.notifications)}
                <Button
                  size="sm"
                  onClick={() => runTest("notifications", testNotifications)}
                >
                  Tester
                </Button>
              </div>
              {permission === "default" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    console.log("🔔 Demande d'autorisation des notifications");
                    await requestPermission();
                  }}
                  className="w-full"
                >
                  ✋ Autoriser les notifications
                </Button>
              )}
              {permission === "denied" && (
                <div className="text-xs text-red-600 p-2 bg-red-50 rounded">
                  ❌ Notifications bloquées. Veuillez les autoriser dans les
                  paramètres de votre navigateur.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Son de Notification
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(testResults.sound)}
              <span className="text-sm">Test audio: notification</span>
            </div>
            <div className="flex justify-between items-center">
              {getStatusBadge(testResults.sound)}
              <Button size="sm" onClick={() => runTest("sound", testSound)}>
                Tester
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Backend</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {" "}
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(testResults.api)}
              <span className="text-sm">Route: /api/health</span>
            </div>
            <div className="flex justify-between items-center">
              {getStatusBadge(testResults.api)}
              <Button size="sm" onClick={() => runTest("api", testAPI)}>
                Tester
              </Button>
            </div>
          </CardContent>{" "}
        </Card>
      </div>

      {/* Section dédiée aux autorisations de notifications */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Autorisations de Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* État actuel des permissions */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">État actuel</h4>

              <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                {permission === "granted" ? (
                  <Bell className="h-5 w-5 text-green-600" />
                ) : permission === "denied" ? (
                  <BellOff className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {permission === "granted" && "✅ Notifications autorisées"}
                    {permission === "denied" && "❌ Notifications bloquées"}
                    {permission === "default" && "⏳ Permissions non demandées"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Statut: <code>{permission}</code>
                  </p>
                </div>
              </div>

              {/* Support du navigateur */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                {typeof window !== "undefined" && "Notification" in window ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {typeof window !== "undefined" && "Notification" in window
                      ? "✅ Navigateur compatible"
                      : "❌ Navigateur non compatible"}
                  </p>
                  <p className="text-xs text-gray-600">
                    API de notifications supportée
                  </p>
                </div>
              </div>
            </div>

            {/* Actions disponibles */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Actions</h4>
              {permission === "default" && (
                <Button
                  onClick={async () => {
                    console.log("🔔 Demande d'autorisation des notifications");
                    const result = await requestPermission();
                    console.log("🔔 Résultat:", result);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Autoriser les notifications
                </Button>
              )}
              {permission === "granted" && (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      console.log("🔔 Test de notification");
                      showTestNotification();
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Tester une notification
                  </Button>

                  <Button
                    onClick={() => {
                      console.log("🔊 Test du son");
                      testNotificationSound();
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Tester le son
                  </Button>
                </div>
              )}{" "}
              {permission === "denied" && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      🚫 Notifications bloquées
                    </p>
                    <p className="text-xs text-red-700">
                      Cliquez sur le bouton ci-dessous pour réessayer d'activer
                      les notifications.
                    </p>
                  </div>

                  <Button
                    onClick={async () => {
                      console.log(
                        "🔔 Nouvelle tentative d'autorisation des notifications"
                      );
                      const result = await requestPermission();
                      console.log("🔔 Résultat:", result);
                      if (result === "denied") {
                        alert(
                          "Notifications toujours bloquées. Veuillez cliquer sur l'icône 🔒 ou ⚙️ à côté de l'URL dans votre navigateur pour les autoriser manuellement."
                        );
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Activer les notifications
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Guide simplifié */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-3">📚 Comment utiliser</h4>
            <div className="grid gap-3 md:grid-cols-2 text-xs text-gray-600">
              <div>
                <p className="font-medium mb-1">1. Activer les notifications</p>
                <p>Cliquez sur le bouton "Autoriser les notifications"</p>
              </div>
              <div>
                <p className="font-medium mb-1">2. Tester</p>
                <p>
                  Utilisez les boutons de test pour vérifier que tout fonctionne
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Complet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {" "}
          <Button
            className="w-full"
            onClick={() => {
              runTest("websocket", testWebSocket);
              runTest("notifications", testNotifications);
              runTest("sound", testSound);
              runTest("api", testAPI);
            }}
          >
            Lancer tous les tests
          </Button>{" "}
          <div className="text-sm text-gray-600">
            <p>
              <strong>WebSocket:</strong> Teste la connexion temps réel
            </p>
            <p>
              <strong>Notifications:</strong> Teste les notifications push des
              messages
            </p>
            <p>
              <strong>Son:</strong> Teste le son de notification
            </p>
            <p>
              <strong>API:</strong> Teste la connectivité backend
            </p>
            <p className="mt-2 text-xs text-blue-600">
              💡 Pour tester les notifications des messages, assurez-vous
              d'abord d'autoriser les notifications, puis ouvrez deux onglets et
              envoyez un message depuis l'autre onglet.
            </p>{" "}
          </div>
        </CardContent>
      </Card>

      {/* Section Diagnostic WebSocket Avancé */}
      <Card className="md:col-span-2 lg:col-span-3 border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-purple-600" />
            Diagnostic WebSocket Avancé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logWebSocketDiagnostic();
                const diagnostic = diagnoseWebSockets();
                alert(
                  `Diagnostic WebSocket:\n${JSON.stringify(
                    diagnostic,
                    null,
                    2
                  )}`
                );
              }}
              className="w-full"
            >
              🔍 Diagnostic Complet
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const health = await testWebSocketHealth();
                console.log("🏥 Test de santé WebSocket:", health);
                alert(`Santé WebSocket:\n${JSON.stringify(health, null, 2)}`);
              }}
              className="w-full"
            >
              🏥 Test de Santé
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                console.log("🧹 Nettoyage des WebSockets...");
                const result = cleanupWebSockets();
                console.log("🧹 Résultat du nettoyage:", result);
                alert(
                  `Nettoyage effectué:\n${result.actions.join(
                    "\n"
                  )}\n\nNettoyé: ${result.cleaned}\nRestant: ${
                    result.remaining
                  }`
                );
              }}
              className="w-full"
            >
              🧹 Nettoyer WS
            </Button>
          </div>

          <div className="text-xs text-gray-600 space-y-2">
            <p>
              <strong>Diagnostic Complet:</strong> Analyse tous les sockets et
              connexions actives
            </p>
            <p>
              <strong>Test de Santé:</strong> Vérifie l'état de santé des
              connexions WebSocket
            </p>
            <p>
              <strong>Nettoyer WS:</strong> Ferme les connexions en double et
              nettoie la mémoire
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Carte Test Système Complet */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Test Système Complet
          </CardTitle>
          <Bug className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            {getStatusIcon(testResults.systemComplete)}
            <span className="text-sm">
              État global: {isListening ? "Opérationnel" : "Problème détecté"}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              {getStatusBadge(testResults.systemComplete)}
              <Button
                size="sm"
                onClick={() => runTest("systemComplete", testSystemComplete)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                🔍 Tester Tout
              </Button>
            </div>

            {/* Résumé des problèmes */}
            {systemStatus && !isListening && (
              <div className="text-xs bg-red-50 p-2 rounded border border-red-200">
                <div className="font-medium text-red-800">
                  ⚠️ Problèmes détectés:
                </div>
                <div className="text-red-700 space-y-1">
                  {!systemStatus.isInitialized && (
                    <div>• WebSocket non initialisé</div>
                  )}
                  {!systemStatus.isReady && (
                    <div>• Service notifications non prêt</div>
                  )}
                  {!systemStatus.hasPermission && (
                    <div>• Permission notifications manquante</div>
                  )}
                  {!systemStatus.hasUser && (
                    <div>• Utilisateur non connecté</div>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={forceResetSystem}
                className="flex-1 text-xs"
              >
                🔄 Reset Complet
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const diagnostic = {
                    websocket: {
                      isConnected,
                      isInitialized,
                      socketExists: !!socket,
                    },
                    notifications: { permission, isReady, isListening },
                    systemStatus,
                    timestamp: new Date().toISOString(),
                  };
                  console.log("🔍 Diagnostic complet:", diagnostic);
                  alert(
                    `Diagnostic complet:\n${JSON.stringify(
                      diagnostic,
                      null,
                      2
                    )}`
                  );
                }}
                className="flex-1 text-xs"
              >
                📋 Export Debug
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
