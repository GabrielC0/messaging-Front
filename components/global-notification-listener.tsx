"use client";

import { useEffect } from "react";
import { useGlobalNotifications } from "../hooks/use-global-notifications";

/**
 * Composant invisible qui écoute les messages WebSocket
 * et déclenche les notifications appropriées au niveau global
 */
export function GlobalNotificationListener() {
  const {
    isListening,
    lastProcessedMessage,
    setActiveConversation,
    systemStatus,
  } = useGlobalNotifications();

  useEffect(() => {
    // Exposer la fonction setActiveConversation globalement
    if (typeof window !== "undefined") {
      (window as any).setActiveConversation = setActiveConversation;
    }
  }, [setActiveConversation]);

  // En mode développement, afficher des informations de debug plus détaillées
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      // console.log("🔔 GlobalNotificationListener État:", {
      //   isListening,
      //   lastProcessedMessage: lastProcessedMessage?.id,
      //   systemStatus,
      //   timestamp: new Date().toISOString(),
      // });
    }
  }, [isListening, lastProcessedMessage, systemStatus]);

  return null;
}
