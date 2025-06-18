"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./use-socket";
import { useNotifications } from "./use-notifications";
import { useAuth } from "../contexts/auth-provider";

/**
 * Hook global pour gérer les notifications de messages
 * À utiliser au niveau de l'application pour écouter tous les messages entrants
 */
export const useGlobalNotifications = () => {
  const { lastMessage, isInitialized } = useSocket();
  const { showMessageNotification, permission, isReady } = useNotifications();
  const { user } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(
    new Set()
  );

  // Fonction pour mettre à jour la conversation actuellement visualisée
  const setActiveConversation = (conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  };

  useEffect(() => {
    // Écouter les changements de conversation depuis le composant ChatWindow
    const handleConversationChange = (event: CustomEvent) => {
      setCurrentConversationId(event.detail.conversationId);
    };

    window.addEventListener(
      "activeConversationChanged",
      handleConversationChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "activeConversationChanged",
        handleConversationChange as EventListener
      );
    };
  }, []);
  useEffect(() => {
    // Attendre que tous les systèmes soient prêts avant de traiter les messages
    if (
      !isInitialized ||
      !isReady ||
      !lastMessage ||
      permission !== "granted" ||
      !user?.id
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Notification bloquée:", {
          isInitialized,
          isReady,
          hasLastMessage: !!lastMessage,
          permission,
          hasUser: !!user?.id,
        });
      }
      return;
    }

    // Éviter les doublons de messages
    const messageKey = `${lastMessage.id}-${
      lastMessage.receivedAt || Date.now()
    }`;
    if (processedMessages.has(messageKey)) {
      console.log("🔍 Message déjà traité:", messageKey);
      return;
    }

    // Vérifier que ce n'est pas un message de l'utilisateur actuel
    if (lastMessage.sender?.id === user.id) {
      console.log("🔍 Message de l'utilisateur actuel, pas de notification");
      return;
    } // Support pour les deux structures possibles du message
    const messageConversationId =
      lastMessage.conversationId || lastMessage.conversation?.id;

    // Ne notifier que si ce n'est pas la conversation active
    const shouldNotify = messageConversationId !== currentConversationId;

    console.log("🔍 Décision notification:", {
      messageConversationId,
      currentConversationId,
      shouldNotify,
      sender: lastMessage.sender?.username,
    });

    if (shouldNotify) {
      try {
        console.log(
          "🔔 Envoi notification pour:",
          lastMessage.sender?.username
        );
        showMessageNotification(lastMessage, {
          conversationName:
            lastMessage.conversation?.title ||
            lastMessage.sender?.username ||
            "Nouveau message",
          forceShow: false,
        });

        // Marquer le message comme traité
        setProcessedMessages((prev) => new Set([...prev, messageKey]));
      } catch (error) {
        console.error("❌ Erreur notification:", error);
      }
    } else {
      console.log("🔍 Pas de notification (conversation active)");
      // Marquer quand même comme traité pour éviter les futures tentatives
      setProcessedMessages((prev) => new Set([...prev, messageKey]));
    }
  }, [
    lastMessage,
    permission,
    user?.id,
    currentConversationId,
    showMessageNotification,
    isInitialized,
    isReady,
    processedMessages,
  ]);
  return {
    isListening:
      !!user?.id && permission === "granted" && isInitialized && isReady,
    lastProcessedMessage: lastMessage,
    setActiveConversation,
    currentConversationId,
    systemStatus: {
      isInitialized,
      isReady,
      hasPermission: permission === "granted",
      hasUser: !!user?.id,
    },
  };
};
