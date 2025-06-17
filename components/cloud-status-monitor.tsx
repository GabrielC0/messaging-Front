"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { 
  isBackendAvailable, 
  connectionState,
  getConnectionInfo,
  forceReconnect,
  testConnectivity
} from "@/lib/apollo-client";

export function CloudStatusMonitor() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting" | "error">("disconnected");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo());
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Mise à jour initiale
    updateStatus();

    const handleBackendUnreachable = (event: Event) => {
      const customEvent = event as CustomEvent;
      const error = customEvent.detail?.error;
      
      setStatus("error");
      setVisible(true);
      setLastError(error?.message || "Erreur de connexion au serveur");
      setConnectionInfo(getConnectionInfo());
      
      console.log("🌐 Backend unreachable:", {
        environment: connectionInfo.isProduction ? "Production (Render.com)" : "Development",
        url: connectionInfo.url,
        error: error?.message
      });
    };

    const handleBackendReconnected = () => {
      setStatus("connected");
      setLastError(null);
      setConnectionInfo(getConnectionInfo());
      
      // Masquer l'alerte après 3 secondes
      setTimeout(() => setVisible(false), 3000);
      
      console.log("✅ Backend reconnected:", {
        environment: connectionInfo.isProduction ? "Production (Render.com)" : "Development",
        url: connectionInfo.url
      });
    };

    const handleNetworkError = (event: Event) => {
      const customEvent = event as CustomEvent;
      setStatus("error");
      setVisible(true);
      setLastError("Erreur réseau - Vérifiez votre connexion internet");
      setConnectionInfo(getConnectionInfo());
    };

    // Écouter les événements
    window.addEventListener("backend-unreachable", handleBackendUnreachable);
    window.addEventListener("backend-reconnected", handleBackendReconnected);
    window.addEventListener("apollo-network-error", handleNetworkError);

    // Vérification périodique du statut
    const statusInterval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener("backend-unreachable", handleBackendUnreachable);
      window.removeEventListener("backend-reconnected", handleBackendReconnected);
      window.removeEventListener("apollo-network-error", handleNetworkError);
      clearInterval(statusInterval);
    };
  }, []);

  const updateStatus = () => {
    const newStatus = connectionState;
    const isAvailable = isBackendAvailable;
    
    setStatus(newStatus);
    setVisible(!isAvailable);
    setConnectionInfo(getConnectionInfo());
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setStatus("connecting");
    
    try {
      await forceReconnect();
      
      // Test de connectivité approfondi
      const isConnected = await testConnectivity(3);
      
      if (isConnected) {
        setStatus("connected");
        setVisible(false);
        setLastError(null);
      } else {
        setStatus("error");
        setLastError("Impossible de se reconnecter au serveur");
      }
    } catch (error) {
      setStatus("error");
      setLastError("Erreur lors de la reconnexion");
      console.error("Reconnection failed:", error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CloudOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    const isProduction = connectionInfo.isProduction;
    
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            {isProduction ? "🌐 Render.com" : "🏠 Local"} - Connecté
          </Badge>
        );
      case "connecting":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Connexion...
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            {isProduction ? "🌐 Render.com" : "🏠 Local"} - Déconnecté
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Statut inconnu
          </Badge>
        );
    }
  };

  const getAlertVariant = () => {
    switch (status) {
      case "connected":
        return "default";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  if (!visible && status === "connected") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant={getAlertVariant()} className="border-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <AlertTitle className="flex items-center gap-2">
            Statut de connexion {getStatusBadge()}
          </AlertTitle>
        </div>
        
        <AlertDescription className="mt-2">
          {status === "connected" && (
            <div className="space-y-1">
              <p className="text-green-600">✅ Connecté au serveur backend</p>
              <p className="text-xs text-muted-foreground">
                {connectionInfo.isProduction 
                  ? "🌐 Environnement de production (Render.com + PostgreSQL)"
                  : "🏠 Environnement de développement local"
                }
              </p>
            </div>
          )}
          
          {status === "connecting" && (
            <div className="space-y-1">
              <p>🔄 Connexion en cours...</p>
              <p className="text-xs text-muted-foreground">
                Tentative de connexion à {connectionInfo.url}
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="space-y-2">
              <p className="text-red-600">❌ Impossible de se connecter au serveur</p>
              {lastError && (
                <p className="text-xs text-muted-foreground">
                  Erreur: {lastError}
                </p>
              )}
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>URL:</strong> {connectionInfo.url}</p>
                <p><strong>Environnement:</strong> {connectionInfo.isProduction ? "Production (Render.com)" : "Développement"}</p>
                <p><strong>Timeout:</strong> {connectionInfo.timeout}ms</p>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isReconnecting ? "animate-spin" : ""}`} />
                  {isReconnecting ? "Reconnexion..." : "Reconnecter"}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setVisible(false)}
                >
                  Masquer
                </Button>
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
