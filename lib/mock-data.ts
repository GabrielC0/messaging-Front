"use client";

import { User, Conversation, Message } from "@/graphql/types";

// Fonction améliorée pour simuler un retard dans les réponses
// avec une variance aléatoire pour rendre les temps de réponse plus réalistes
export const simulateDelay = (baseMs: number = 300) => {
  // Ajouter une variance aléatoire de ±30% pour simuler un comportement plus réaliste
  const variance = baseMs * 0.3;
  const delay = baseMs + (Math.random() * variance * 2 - variance);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Fonction pour générer des données fictives à la demande
export const generateMockMessage = (
  conversationId: string,
  senderId: string,
  content: string
): Message => {
  return {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    content,
    sender: { id: senderId } as User,
    conversation: { id: conversationId } as Conversation,
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Fonction pour créer une nouvelle conversation fictive
export const generateMockConversation = (
  participantIds: string[],
  title?: string
): Conversation => {
  return {
    id: `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title || undefined,
    participants: participantIds.map((id) => ({ id } as User)),
    messages: [],
    lastActivity: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
