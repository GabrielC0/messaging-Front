"use client";

import { useEffect } from "react";
import { useNotifications } from "../hooks/use-notifications";
import { useAuth } from "../contexts/auth-provider";

/**
 * Composant pour initialiser les notifications automatiquement
 * quand l'utilisateur se connecte
 */
export function NotificationInitializer() {
  const { permission, requestPermission } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    // Demander automatiquement la permission de notification quand l'utilisateur se connecte
    if (user && permission === "default") {
      console.log("🔔 Demande automatique de permission de notification");

      // Délai pour éviter de demander immédiatement après la connexion
      const timer = setTimeout(() => {
        requestPermission().then((newPermission) => {
          console.log("🔔 Permission de notification:", newPermission);
        });
      }, 2000); // 2 secondes après la connexion

      return () => clearTimeout(timer);
    }
  }, [user, permission, requestPermission]);

  return null;
}
