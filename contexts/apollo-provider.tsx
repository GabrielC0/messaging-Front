"use client";

import { ApolloProvider } from "@apollo/client";
import {
  client,
  checkBackendAvailability,
  isBackendAvailable,
  resetApolloCache,
  startBackendMonitoring,
} from "@/lib/apollo-client";
import { ReactNode, useState, useEffect } from "react";

export function ApolloProviderWrapper({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [hasAttemptedReconnection, setHasAttemptedReconnection] =
    useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const checkConnection = async () => {
    try {
      const isAvailable = await checkBackendAvailability();
      setIsConnecting(false);

      if (!isAvailable) {
        setConnectionError(
          new Error("Impossible de se connecter au serveur GraphQL")
        );
        setIsOfflineMode(true);
        console.warn("Backend unavailable, using offline mode with mock data");
      } else if (connectionError) {
        setConnectionError(null);
        setIsOfflineMode(false);
        resetApolloCache();
        console.log("Backend connection restored, switched to online mode");
      }
    } catch (error) {
      console.error("Failed to connect to GraphQL backend:", error);
      setConnectionError(error as Error);
      setIsOfflineMode(true);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    const cleanup = startBackendMonitoring(30000);

    const handleReconnection = () => {
      console.log("Backend reconnected!");
      setIsOfflineMode(false);
      setConnectionError(null);
      checkConnection();
    };

    window.addEventListener("backend-reconnected", handleReconnection);

    return () => {
      cleanup();
      window.removeEventListener("backend-reconnected", handleReconnection);
    };
  }, []);

  useEffect(() => {
    const handleNetworkError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      console.log(
        `Network error detected (attempt ${detail.consecutive}), will try to reconnect...`
      );

      if (!hasAttemptedReconnection) {
        console.log("Scheduling reconnection attempt in 5 seconds...");
        setTimeout(() => {
          setHasAttemptedReconnection(true);
          checkConnection();
        }, 5000);
      }

      if (detail.consecutive >= 3) {
        setIsOfflineMode(true);
      }
    };

    window.addEventListener("apollo-network-error", handleNetworkError);
    window.addEventListener("backend-unreachable", () => {
      setIsOfflineMode(true);
      console.warn("Backend declared unreachable, switching to offline mode");
    });

    return () => {
      window.removeEventListener("apollo-network-error", handleNetworkError);
      window.removeEventListener("backend-unreachable", () => {});
    };
  }, [hasAttemptedReconnection]);

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion au serveur...</p>
        </div>
      </div>
    );
  }

  const offlineNotification = isOfflineMode ? (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center text-sm z-50">
      Mode hors ligne - Utilisation de données locales
    </div>
  ) : null;

  return (
    <ApolloProvider client={client}>
      {offlineNotification}
      {children}
    </ApolloProvider>
  );
}
