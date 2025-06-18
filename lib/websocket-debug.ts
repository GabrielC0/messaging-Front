"use client";

/**
 * Utilitaires de debug et diagnostic pour les WebSockets
 */

export interface WebSocketDiagnostic {
  globalSockets: any[];
  activeConnections: number;
  conflictingSockets: any[];
  recommendations: string[];
}

export function diagnoseWebSockets(): WebSocketDiagnostic {
  const diagnostic: WebSocketDiagnostic = {
    globalSockets: [],
    activeConnections: 0,
    conflictingSockets: [],
    recommendations: [],
  };

  // Vérifier les variables globales pour les sockets
  if (typeof window !== "undefined") {
    // Rechercher des sockets dans window
    Object.keys(window).forEach((key) => {
      const value = (window as any)[key];
      if (
        value &&
        typeof value === "object" &&
        (value.constructor?.name?.includes("Socket") ||
          value.constructor?.name?.includes("IO") ||
          key.toLowerCase().includes("socket"))
      ) {
        diagnostic.globalSockets.push({
          key,
          constructor: value.constructor?.name,
          connected: value.connected,
          id: value.id,
          url: value.io?.uri || value.url,
        });
      }
    });

    // Vérifier s'il y a plusieurs sockets actifs
    const activeSockets = diagnostic.globalSockets.filter((s) => s.connected);
    diagnostic.activeConnections = activeSockets.length;

    if (diagnostic.activeConnections > 1) {
      diagnostic.conflictingSockets = activeSockets;
      diagnostic.recommendations.push(
        "⚠️ Multiples connexions WebSocket détectées - risque de conflit"
      );
      diagnostic.recommendations.push(
        "🔧 Fermer les connexions inactives avec cleanupWebSockets()"
      );
    }

    if (diagnostic.globalSockets.length > diagnostic.activeConnections) {
      diagnostic.recommendations.push(
        "🧹 Des sockets déconnectés traînent en mémoire"
      );
    }

    if (diagnostic.activeConnections === 0) {
      diagnostic.recommendations.push(
        "❌ Aucune connexion WebSocket active détectée"
      );
    }
  }

  return diagnostic;
}

export function cleanupWebSockets(): {
  cleaned: number;
  remaining: number;
  actions: string[];
} {
  const result = {
    cleaned: 0,
    remaining: 0,
    actions: [] as string[],
  };

  if (typeof window !== "undefined") {
    // Nettoyer les sockets globaux
    Object.keys(window).forEach((key) => {
      const value = (window as any)[key];
      if (
        value &&
        typeof value === "object" &&
        (value.constructor?.name?.includes("Socket") ||
          value.constructor?.name?.includes("IO") ||
          key.toLowerCase().includes("socket"))
      ) {
        try {
          if (value.disconnect && typeof value.disconnect === "function") {
            value.disconnect();
            result.cleaned++;
            result.actions.push(`🔌 Disconnected ${key}`);
          }

          // Essayer de supprimer la référence globale
          if (key !== "WebSocket" && key !== "socket") {
            delete (window as any)[key];
            result.actions.push(`🗑️ Removed global reference ${key}`);
          }
        } catch (error) {
          result.actions.push(`❌ Error cleaning ${key}: ${error}`);
        }
      }
    });

    // Compter ce qui reste
    const remaining = diagnoseWebSockets();
    result.remaining = remaining.activeConnections;
  }

  return result;
}

export function logWebSocketDiagnostic(): void {
  console.group("🔍 Diagnostic WebSocket");

  const diagnostic = diagnoseWebSockets();

  console.log("📊 Résumé:", {
    socketsGlobaux: diagnostic.globalSockets.length,
    connexionsActives: diagnostic.activeConnections,
    conflits: diagnostic.conflictingSockets.length,
  });

  if (diagnostic.globalSockets.length > 0) {
    console.log("🌐 Sockets globaux trouvés:", diagnostic.globalSockets);
  }

  if (diagnostic.conflictingSockets.length > 0) {
    console.warn("⚠️ Conflits détectés:", diagnostic.conflictingSockets);
  }

  if (diagnostic.recommendations.length > 0) {
    console.log("💡 Recommandations:", diagnostic.recommendations);
  }

  console.groupEnd();
}

// Fonction utilitaire pour les tests
export function testWebSocketHealth(): Promise<{
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
}> {
  return new Promise((resolve) => {
    const diagnostic = diagnoseWebSockets();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Vérifier les problèmes courants
    if (diagnostic.activeConnections === 0) {
      issues.push("Aucune connexion WebSocket active");
      recommendations.push("Vérifier l'initialisation du WebSocket");
    }

    if (diagnostic.activeConnections > 1) {
      issues.push("Multiples connexions WebSocket actives");
      recommendations.push("Utiliser cleanupWebSockets() pour nettoyer");
    }

    if (diagnostic.globalSockets.some((s) => !s.connected && s.id)) {
      issues.push("Des sockets déconnectés persistent en mémoire");
      recommendations.push("Nettoyer les références aux sockets fermés");
    }

    const isHealthy = issues.length === 0;

    resolve({
      isHealthy,
      issues,
      recommendations: [...recommendations, ...diagnostic.recommendations],
    });
  });
}
