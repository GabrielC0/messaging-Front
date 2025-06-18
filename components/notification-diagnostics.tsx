"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { useNotifications } from "@/hooks/use-notifications";
import { useGlobalNotifications } from "@/hooks/use-global-notifications";
import { useAuth } from "@/contexts/auth-provider";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

/**
 * Composant de diagnostic pour le système de notifications
 * Affiche l'état en temps réel de tous les composants
 */
export function NotificationDiagnostics() {
  const [isVisible, setIsVisible] = useState(false);
  const { isConnected, isInitialized, lastMessage } = useSocket();
  const { permission, isReady } = useNotifications();
  const { isListening, systemStatus } = useGlobalNotifications();
  const { user } = useAuth();
  const [diagnosticData, setDiagnosticData] = useState<any>({});

  // Mise à jour périodique des diagnostics
  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnosticData({
        timestamp: new Date().toISOString(),
        socket: {
          isConnected,
          isInitialized,
          lastMessageId: lastMessage?.id,
          lastMessageTime: lastMessage?.receivedAt,
        },
        notifications: {
          permission,
          isReady,
          isListening,
          systemStatus,
        },
        auth: {
          hasUser: !!user,
          userId: user?.id,
          username: user?.username,
        },
        browser: {
          notificationSupport:
            typeof window !== "undefined" && "Notification" in window,
          visibilityState:
            typeof document !== "undefined"
              ? document.visibilityState
              : "unknown",
          isOnline:
            typeof navigator !== "undefined" ? navigator.onLine : "unknown",
        },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isConnected,
    isInitialized,
    lastMessage,
    permission,
    isReady,
    isListening,
    systemStatus,
    user,
  ]);

  // Afficher/masquer avec Ctrl+Shift+D
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [isVisible]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge
        variant={status ? "default" : "destructive"}
        className={status ? "bg-green-500" : ""}
      >
        {status ? "✅" : "❌"} {label}
      </Badge>
    );
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="opacity-50 hover:opacity-100"
        >
          🔍 Diagnostics
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 z-50 space-y-2 max-h-screen overflow-auto">
      <Card className="bg-white/95 backdrop-blur border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              🔔 Diagnostics Notifications
              <RefreshCw className="h-3 w-3 animate-spin" />
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* État global */}
          <div className="space-y-1">
            <div className="font-medium">État Global</div>
            <div className="flex flex-wrap gap-1">
              {getStatusBadge(systemStatus?.isInitialized, "WebSocket")}
              {getStatusBadge(systemStatus?.isReady, "Notifications")}
              {getStatusBadge(systemStatus?.hasPermission, "Permission")}
              {getStatusBadge(systemStatus?.hasUser, "Utilisateur")}
            </div>
          </div>

          {/* WebSocket */}
          <div className="space-y-1">
            <div className="font-medium">WebSocket</div>
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(isConnected)}
              <span>Connexion: {isConnected ? "Connecté" : "Déconnecté"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(isInitialized)}
              <span>Initialisé: {isInitialized ? "Oui" : "Non"}</span>
            </div>
            {lastMessage && (
              <div className="text-xs text-gray-600">
                Dernier message: {lastMessage.id} (
                {new Date(
                  lastMessage.receivedAt || Date.now()
                ).toLocaleTimeString()}
                )
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="space-y-1">
            <div className="font-medium">Notifications</div>
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(permission === "granted")}
              <span>Permission: {permission}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(isListening)}
              <span>Écoute active: {isListening ? "Oui" : "Non"}</span>
            </div>
          </div>

          {/* Utilisateur */}
          <div className="space-y-1">
            <div className="font-medium">Utilisateur</div>
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(!!user)}
              <span>Connecté: {user ? user.username : "Non"}</span>
            </div>
          </div>

          {/* Navigateur */}
          <div className="space-y-1">
            <div className="font-medium">Navigateur</div>
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(diagnosticData.browser?.notificationSupport)}
              <span>Support notifications</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(
                diagnosticData.browser?.visibilityState === "visible"
              )}
              <span>Page: {diagnosticData.browser?.visibilityState}</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            Mise à jour:{" "}
            {new Date(diagnosticData.timestamp).toLocaleTimeString()}
          </div>

          {/* Conseils */}
          {!isListening && (
            <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
              <div className="font-medium text-yellow-800">
                💡 Problème détecté
              </div>
              <div className="text-yellow-700">
                {!systemStatus?.isInitialized && "• WebSocket non initialisé"}
                {!systemStatus?.isReady && "• Service notifications non prêt"}
                {!systemStatus?.hasPermission &&
                  "• Permission notifications requise"}
                {!systemStatus?.hasUser && "• Connexion utilisateur requise"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
